const axios = require('axios');
const adminModel = require('../models/admin');
const walletModel = require('../models/wallet');
const withdrawalModel = require('../models/withdrawals');

const KORA_BASE_URL = (process.env.KORA_BASE_URL || 'https://api.korapay.com/merchant/api/v1').trim();

const toNumber = (value) => Number(value || 0);

const createReference = () => {
  const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `UCH-WD-${Date.now()}-${suffix}`;
};

const mapProviderStatus = (status) => {
  const normalizedStatus = String(status || '').toLowerCase();

  if (['success', 'successful', 'completed'].includes(normalizedStatus)) return 'successful';
  if (['failed', 'failure', 'reversed', 'cancelled'].includes(normalizedStatus)) return 'failed';
  return 'processing';
};

const getKoraErrorMessage = (error) => {
  const responseData = error.response?.data;

  return responseData?.message
    || responseData?.error
    || responseData?.data?.message
    || responseData?.data?.error
    || error.message
    || 'Kora payout request failed';
};

const getKoraErrorDetails = (error) => {
  return error.response?.data || { message: error.message };
};

const refundWalletWithdrawal = async (walletId, amount) => {
  await walletModel.findByIdAndUpdate(walletId, {
    $inc: {
      balance: amount,
      withdrawal: -amount,
      totalTransaction: -1
    }
  });
};

// Per Kora's Payout API docs (Bank Account Resolve), the `currency` field here
// is the 2-letter COUNTRY code (NG, KE) — not the 3-letter ISO currency code
// (NGN, KES) used everywhere else in this file, including the disburse call below.
// Sending "NGN" instead of "NG" is what produces "resource not found".
const CURRENCY_TO_RESOLVE_COUNTRY = {
  NGN: 'NGN',
  KES: 'KE'
};

const toResolveCountryCode = (currency) => {
  const code = String(currency || '').toUpperCase();
  return CURRENCY_TO_RESOLVE_COUNTRY[code] || code;
};

// Bank Account Resolve API — POST with { bank, account, currency } in the body.
// Required fields per Kora docs: bank, account, currency (country code: NG or KE).
// Only supports Nigerian and Kenyan banks; not available for GHS/ZAR/USD/GBP destinations.
const verifyBankAccount = async (bankCode, accountNumber, currency = 'NGN') => {
  try {
    const { data } = await axios.post(
      `${KORA_BASE_URL}/misc/banks/resolve`,
      {
        bank: bankCode,
        account: accountNumber,
        currency: toResolveCountryCode(currency)
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      valid: true,
      accountName: data?.data?.account_name || null
    };
  } catch (error) {
    console.error('Kora bank verification error:', getKoraErrorDetails(error));

    return {
      valid: false,
      message: getKoraErrorMessage(error),
      details: getKoraErrorDetails(error)
    };
  }
};

exports.requestWithdrawal = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const {
      amount,
      accountNumber,
      accountName,
      bankName,
      bankCode,
      currency = 'NGN',
      narration = 'Ucheva withdrawal'
    } = req.body;

    if (!process.env.KORA_API_KEY) {
      return res.status(500).json({ message: 'Kora API key is not configured' });
    }

    const withdrawalAmount = Number(amount);
    if (!Number.isFinite(withdrawalAmount) || withdrawalAmount <= 0) {
      return res.status(400).json({ message: 'Withdrawal amount must be greater than zero' });
    }

    if (!accountNumber || !bankCode || !accountName) {
      return res.status(400).json({ message: 'Account number, bank code, and account name are required' });
    }

    const admin = await adminModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // verify the bank account with the provider before touching the wallet
    const verification = await verifyBankAccount(bankCode, accountNumber, currency);
    if (!verification.valid) {
      return res.status(400).json({
        message: 'Unable to verify bank account',
        reason: verification.message,
        koraResponse: verification.details
      });
    }

    const verifiedName = (verification.accountName || '').toLowerCase();
    const submittedName = (accountName || '').toLowerCase();
    const namesMatch = verifiedName && submittedName
      && (verifiedName.includes(submittedName.split(' ')[0]) || submittedName.includes(verifiedName.split(' ')[0]));

  if (process.env.NODE_ENV === "production" && !namesMatch) {
    return res.status(400).json({
        message: "Account name does not match the provided account number",
        bankAccountName: verification.accountName
    });
}

    const wallet = await walletModel.findOne({ adminId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (toNumber(wallet.balance) < withdrawalAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    const reference = createReference();

    wallet.balance = toNumber(wallet.balance) - withdrawalAmount;
    wallet.withdrawal = toNumber(wallet.withdrawal) + withdrawalAmount;
    wallet.totalTransaction = toNumber(wallet.totalTransaction) + 1;
    await wallet.save();

    const withdrawal = await withdrawalModel.create({
      adminId,
      walletId: wallet.id,
      schoolUrl: wallet.schoolUrl || admin.schoolUrl,
      amount: withdrawalAmount,
      currency,
      accountNumber,
      accountName,
      verifiedAccountName: verification.accountName,
      bankName,
      bankCode,
      reference,
      narration,
      requestDate: new Date(),
      status: 'processing'
    });

    try {
      // Test mode: bank codes 044 (Access Bank), 033 (UBA), and 058 (GTCO)
      // simulate a SUCCESSFUL payout per Kora's docs.
      const koraResponse = await axios.post(
        `${KORA_BASE_URL}/transactions/disburse`,
        {
          reference,
          destination: {
            type: 'bank_account',
            amount: withdrawalAmount,
            currency,
            narration,
            customer: {
              name: accountName,
              email: admin.email
            },
            bank_account: {
              bank: bankCode,
              account: accountNumber
            }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.KORA_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const providerData = koraResponse.data?.data || {};
      const providerStatus = mapProviderStatus(providerData.status || koraResponse.data?.status);

      Object.assign(withdrawal, {
        status: providerStatus,
        koraReference: providerData.reference || providerData.transaction_reference || reference,
        providerResponse: koraResponse.data,
        failureReason: providerStatus === 'failed'
          ? providerData.message || koraResponse.data?.message || 'Kora marked withdrawal as failed'
          : null,
        processedAt: providerStatus === 'processing' ? null : new Date()
      });
      await withdrawal.save();

      if (providerStatus === 'failed') {
        await refundWalletWithdrawal(wallet.id, withdrawalAmount);
      }

      return res.status(201).json({
        message: 'Withdrawal request submitted successfully',
        withdrawal: {
          id: withdrawal.id,
          reference,
          koraReference: providerData.reference || providerData.transaction_reference || null,
          amount: withdrawalAmount,
          currency,
          status: providerStatus,
          accountName,
          verifiedAccountName: verification.accountName,
          accountNumber,
          bankName
        },
        wallet: {
          previousBalance: toNumber(wallet.balance) + withdrawalAmount,
          currentBalance: providerStatus === 'failed' ? toNumber(wallet.balance) + withdrawalAmount : toNumber(wallet.balance)
        }
      });
    } catch (koraError) {
      const failureReason = getKoraErrorMessage(koraError);
      const providerResponse = getKoraErrorDetails(koraError);

      console.error('Kora withdrawal error:', providerResponse);

      await refundWalletWithdrawal(wallet.id, withdrawalAmount);

      Object.assign(withdrawal, {
        status: 'failed',
        failureReason,
        providerResponse,
        processedAt: new Date()
      });
      await withdrawal.save();
    console.log(koraError.response?.data);
      return res.status(koraError.response?.status || 502).json({
        message: 'Withdrawal provider error, funds refunded',
        reason: failureReason,
        koraResponse: providerResponse,
        reference
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getWithdrawalHistory = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);

    const where = { adminId };
    if (status) {
      where.status = status;
    }

    const [rows, count] = await Promise.all([
      withdrawalModel
        .find(where)
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit),
      withdrawalModel.countDocuments(where)
    ]);

    return res.status(200).json({
      message: 'Withdrawal history retrieved successfully',
      withdrawals: rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: count,
        totalPages: Math.ceil(count / safeLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getWithdrawalByReference = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const adminId = req.user.id;

    const withdrawal = await withdrawalModel.findOne({ adminId, reference });

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    return res.status(200).json({
      message: 'Withdrawal retrieved successfully',
      withdrawal
    });
  } catch (error) {
    next(error);
  }
};
