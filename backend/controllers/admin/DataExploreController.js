const config = require("@configs/config");
const Entity = require("@model/Entity");
const niv = require("node-input-validator");
const CResponse = require("@response");
const { Validator } = niv;
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Transaction = require("@model/TransactionMapping");
const User = require("@model/User");
const Reports = require("@model/Reports");
const eventTrigger = require("../../helpers/eventTrigger");
const {
  createTransaction,
  getTransactionId,
  getTransactionById,
  burnRecord,
  transferTransaction
} = require("@helper/bigchainDBHelper");

exports.add = async function (req, res) {
  console.log(req.body);
  try {
    let assets = req.body.asset;
    let entity_id = req.body.entity_id;
    let entityDetail = await Entity.findOne({ id: entity_id, status: 1 });
    if (!entityDetail) {
      eventTrigger("DATA", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ entity_id: entity_id } }, "Transaction add")
      CResponse.returnResponse(
        req,
        res,
        400,
        "Invalid entity",
        false,
        assets)
    }

    console.log(req.user);
    if (!req.user.private_key || !req.user.public_key) {
      eventTrigger("DATA", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ entity_id: entity_id } }, "Transaction add")
      CResponse.returnResponse(
        req,
        res,
        400,
        "Please provide the public and private for ownership",
        false,
        assets
      );
    }
    let alice = req.body.keys;
    if (!alice) {
      alice = {
        privateKey: req.user.private_key,
        publicKey: req.user.public_key,
      };
    }
    console.log(alice);
    if (typeof assets != "object" || !assets) {
      eventTrigger("DATA", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ entity_id: entity_id } }, "Transaction add")
      CResponse.returnResponse(
        req,
        res,
        400,
        "Invaid data format for transaction",
        false,
        assets
      );
    } else {
      var metaData = {
        user_id: req.user._id || req.user._id,
        company_id: req.user.company_id || req.user.company_id,
        entity_id: entity_id,
        private_key: req.user.private_key,
      };
      var transactionId = await createTransaction(assets, metaData, alice);
      var transaction = new Transaction();
      transaction.user_id = req.user._id || req.user._id;
      transaction.company_id = req.user.company_id || req.user.company_id;
      transaction.transaction_id = transactionId;
      transaction.entity_id = entity_id;
      var saveTrnsaction = await transaction.save();
      eventTrigger("DATA", "CREATE", req.user, { ...req.body, ...{ transaction_id: transactionId, entity_id: entity_id } }, "Transaction add")
      let report = new Reports();
      let createPattern = {
        user_id: ObjectId(req.user._id),
        group_id: ObjectId(req.user.group_id),
        entity: entityDetail.name,
        company_id: ObjectId(req.user.company_id),
        action: "add"
      }
      report.saveRecord(createPattern)
      CResponse.returnResponse(
        req,
        res,
        200,
        "Record has been inserted",
        true,
        saveTrnsaction
      );
    }
  } catch (err) {
    eventTrigger("DATA", "INTEGRITY_FAILED", req.user, req.body, "Transaction add")
    console.log(err);
    // create error logs on server crash
    CResponse.returnResponse(
      req,
      res,
      500,
      err.message || "Something went wrong!",
      false,
      err.message
    );
  }
};

exports.getTransaction = async function (req, res) {
  try {
    var transaction = await getTransactionById(req.params.id);
    CResponse.returnResponse(req, res, 200, "Success", true, transaction);
  } catch (err) {
    console.log(err);
    // create error logs on server crash
    CResponse.returnResponse(
      req,
      res,
      500,
      err.message || "Something went wrong!",
      false,
      err.message
    );
  }
};

exports.getTransactionList = async function (req, res) {
  try {
    let search = req.params.id;
    let transactionArray = [];
    var transaction = await getTransactionId(search);
    console.log(transaction);
    console.log(search);
    await transaction.reduce(async (promise, ele) => {
      console.log(ele);
      await promise;
      let response = await getTransactionById(ele);
      transactionArray.push(response);
    }, Promise.resolve());
    if (req.user.role_id === "user") {
      transaction = transaction.filter((ele) => {
        if (req.user.public_key == ele["outputs"][0]["public_keys"][0]) {
          return ele;
        }
      });
    }
    CResponse.returnResponse(req, res, 200, "Success", true, transactionArray);
  } catch (err) {
    console.log(err);
    // create error logs on server crash
    CResponse.returnResponse(
      req,
      res,
      500,
      err.message || "Something went wrong!",
      false,
      err.message
    );
  }
};

exports.burnTransaction = async function (req, res) {
  try {
    if (!req.params.id) {
      eventTrigger("DATA", "INTEGRITY_FAILED", req.user, req.body, "Transaction delete")
      CResponse.returnResponse(
        req,
        res,
        400,
        "Transaction id is missing!",
        false,
        err.message
      );
    }
    let transaction = await getTransactionById(req.params.id);

    // check is role type user and have own the transaction
    if (req.user.role_id == "user") {
      console.log("my public key", req.user.public_key);
      if (req.user.public_key != transaction["outputs"][0]["public_keys"][0]) {
        eventTrigger("DATA", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ entity_id: transaction.metadata.entity_id } }, "Transaction delete")
        CResponse.returnResponse(
          req,
          res,
          400,
          "You don't have ownership this transaction",
          false,
          null
        );
        return;
      }
    }

    // get the private key of transaction to transfer
    let private_key = "";
    if (req.user.role_id === "user") {
      private_key = req.user.private_key;
    } else if (
      req.user.public_key == transaction["outputs"][0]["public_keys"][0]
    ) {
      private_key = req.user.private_key;
    } else {
      if (!transaction.metadata.user_id) {
        CResponse.returnResponse(
          req,
          res,
          400,
          "Private key is missing to burn the transaction",
          false,
          null
        );
        return;
      }
    }
    var query = await User.findOne({ user_id: transaction.metadata.user_id });
    if (!query || !query.private_key) {
      eventTrigger("DATA", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ entity_id: transaction.metadata.entity_id } }, "Transaction delete")
      CResponse.returnResponse(
        req,
        res,
        400,
        "Private key is missing to burn the transaction",
        false,
        null
      );
      return;
    }
    console.log("query -------->", query);
    private_key = query.private_key;

    if (!private_key) {
      eventTrigger("DATA", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ entity_id: transaction.metadata.entity_id } }, "Transaction delete")
      CResponse.returnResponse(
        req,
        res,
        400,
        "Private key is missing to burn the transaction",
        false,
        null
      );
      return;
    }

    let response = await burnRecord(
      req.params.id,
      private_key,
      transaction.metadata
    );
    let entityDetail = await Entity.findOne({ id: transaction.metadata.entity_id, status: 1 });
    eventTrigger("DATA", "DELETE", req.user, { ...req.body, ...{ transaction_id: req.params.id, entity_id: transaction.metadata.entity_id } }, "Transaction delete")
    let report = new Reports();
    let createPattern = {
      user_id: ObjectId(req.user.id),
      group_id: ObjectId(req.user.group_id),
      entity: entityDetail.name,
      company_id: ObjectId(req.user.company_id),
      action: "add"
    }
    report.saveRecord(createPattern)
    CResponse.returnResponse(
      req,
      res,
      200,
      "Record has been burned",
      true,
      response
    );
  } catch (err) {
    eventTrigger("DATA", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ entity_id: transaction.metadata.entity_id } }, "Transaction delete")
    console.log(err);
    // create error logs on server crash
    CResponse.returnResponse(
      req,
      res,
      500,
    );
  }
};

exports.transaferTransaction = async function (req, res) {
  try {
    console.log(req.user);
    if (!req.params.id) {
      eventTrigger("DATA", "INTEGRITY_FAILED", req.user, req.body, "Transaction transafer")
      CResponse.returnResponse(req, res, 400, "Transaction id is missing!", false, err.message);
    }

    if (!req.body.user) {
      eventTrigger("DATA", "INTEGRITY_FAILED", req.user, req.body, "Transaction transafer")
      CResponse.returnResponse(req, res, 400, "Select user for transfer transaction!", false, err.message);
      return;
    }

    var transferUser = await User.findOne({ _id: ObjectId(req.body.user) });
    if (!transferUser || !transferUser.public_key || !transferUser.private_key) {
      eventTrigger("DATA", "INTEGRITY_FAILED", req.user, req.body, "Transaction transafer")
      CResponse.returnResponse(req, res, 400, "Invalid user to transafer transaction!", false, err.message);
      return;
    }
    var transaction = {};
    transaction = await getTransactionById(req.params.id);
    console.log(transaction)
    // check is role type user and have own the transaction
    if (req.user.role_id == "user") {
      console.log("my public key", req.user.public_key);
      if (req.user.public_key != transaction["outputs"][0]["public_keys"][0]) {
        eventTrigger("DATA", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ entity_id: transaction.metadata.entity_id } }, "Transaction transafer")
        CResponse.returnResponse(req, res, 400, "You don't have ownership this transaction", false, null);
        return;
      }
    }
    // get the private key of transaction to transfer
    let private_key = "";

    if (req.user.role_id === "user") {
      private_key = req.user.private_key;
    } else if (
      req.user.public_key == transaction["outputs"][0]["public_keys"][0]
    ) {
      private_key = req.user.private_key;
    } else {
      if (!transaction.metadata.user_id) {
        CResponse.returnResponse(req, res, 400, "Private key is missing to transfer the transaction", false, null);
        return;
      } else {
        var query = await User.findOne({ _id: transaction.metadata.user_id });
        if (!query || !query.private_key) {
          eventTrigger("DATA", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ entity_id: transaction.metadata.entity_id } }, "Transaction transafer")
          CResponse.returnResponse(req, res, 400, "Private key is missing to transfer the transaction", false, null);
          return;
        }
        console.log("query -------->", query)
        private_key = query.private_key;
      }
    }


    if (!private_key) {
      eventTrigger("DATA", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ entity_id: transaction.metadata.entity_id } }, "Transaction transafer")
      CResponse.returnResponse(req, res, 400, "Private key is missing to transfer the transaction", false, null);
      return;
    }

    let response = await transferTransaction(req.params.id, private_key, transferUser, transaction.metadata);
    let entityDetail = await Entity.findOne({ id: transaction.metadata.entity_id, status: 1 });
    let report = new Reports();
    let createPattern = {
      user_id: ObjectId(req.user.id),
      group_id: ObjectId(req.user.group_id),
      entity: entityDetail.name,
      company_id: ObjectId(req.user.company_id),
      action: "add"
    }
    report.saveRecord(createPattern)
    eventTrigger("DATA", "DELETE", req.user, { ...req.body, ...{ transaction_id: req.params.id, entity_id: transaction.metadata.entity_id } }, "Transaction transafer")
    CResponse.returnResponse(req, res, 200, "Record has been transfered", true, response);
  } catch (err) {
    eventTrigger("DATA", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ entity_id: transaction.metadata && transaction.metadata.entity_id || "NA" } }, "Transaction transafer")
    console.log('err------>', err);
    // create error logs on server crash
    CResponse.returnResponse(req, res, 500, err.message);
  }
};
