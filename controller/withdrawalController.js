// const walletModel = require('../models/wallet')
// const withdrawalModel = require('../models/withdrawal')
// exports.payoutFunds = async (req, res) => {
//     const t = await sequelize.transaction();
//     try {
//         const vendorId = req.user.id;
//         const { amount, bankId } = req.body;
//         const amt = Number(amount);

//         if (!Number.isFinite(amt) || amt <= 0) {
//             await t.rollback();
//             return res.status(400).json({ message: "Invalid amount" });
//         }

//         const bank = await bankModel.findOne({ where: { id: bankId, vendorId }, transaction: t });
//         if (!bank) {
//             await t.rollback();
//             return res.status(404).json({ message: "Bank account not found" });
//         }

//         const vendor = await vendorModel.findByPk(vendorId, { transaction: t });

//         const ref = otpGenerator.generate(12, {
//             specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
//         });
//         const reference = `UCHEVA-${ref}`;

//         // atomic debit guarded by balance check, inside the transaction
//         const [, affectedRows] = await walletModel.decrement('balance', {
//             by: amt,
//             where: { vendorId, balance: { [Op.gte]: amt } },
//             transaction: t
//         });
//         if (!affectedRows) {
//             await t.rollback();
//             return res.status(400).json({ message: "Insufficient funds." });
//         }

//         const payout = await payoutModel.create(
//             { amount: amt, reference, vendorId, bankId, status: 'pending' },
//             { transaction: t }
//         );
//         await withdrawalModel.create(
//             { vendorId, transactionType: 'withdraw', amount: amt, status: 'pending', reference },
//             { transaction: t }
//         );

//         await t.commit();

//         // call Korapay only after the DB state is safely committed
//         try {
//             await axios.post(
//                 "https://api.korapay.com/merchant/api/v1/transactions/disburse",
//                 {
//                     reference,
//                     destination: {
//                         type: "bank_account",
//                         amount: amt,
//                         currency: "NGN",
//                         narration: "Investment withdrawal",
//                         customer: { name: bank.accountName, email: vendor.email },
//                         bank_account: { bank: bank.bankCode, account: bank.accountNumber }
//                     }
//                 },
//                 { headers: { Authorization: `Bearer ${process.env.KORA_API_KEY}`, "Content-Type": "application/json" } }
//             );
//         } catch (disburseError) {
//             // mark as failed and refund — disbursement call itself failed (not just pending)
//             await walletModel.increment('balance', { by: amt, where: { vendorId } });
//             await payout.update({ status: 'failed' });
//             console.error("Disbursement Error:", disburseError.response?.data || disburseError.message);
//             return res.status(502).json({ message: "Payout provider error, funds refunded." });
//         }

//         return res.status(200).json({
//             message: "Payout initiated successfully",
//             data: { reference, amount: amt, status: 'pending' }
//         });

//     } catch (error) {
//         await t.rollback();
//         console.error("Disbursement Error:", error.response?.data || error.message);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };