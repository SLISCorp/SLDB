const http = require("http");
const config = require("@configs/config");
const driver = require("bigchaindb-driver");
const base58 = require("bs58");
const { Ed25519Sha256 } = require("crypto-conditions");

const API_PATH = `http://${config.nodeConfig.first_node_ip}:${config.nodeConfig.port}/api/v1/`;
console.log(API_PATH);
// Create a new keypair.

exports.createTransaction = (assest, metadata, alice) => {
  return new Promise((resolve, reject) => {
    const tx = driver.Transaction.makeCreateTransaction(
      assest,
      metadata,
      // A transaction needs an output
      [
        driver.Transaction.makeOutput(
          driver.Transaction.makeEd25519Condition(alice.publicKey)
        ),
      ],
      alice.publicKey
    );
    console.log("private key", alice.privateKey);
    // Sign the transaction with private keys
    const txSigned = driver.Transaction.signTransaction(tx, alice.privateKey);
    console.log(txSigned);
    // Send the transaction off to BigchainDB
    const conn = new driver.Connection(API_PATH);
    console.log(JSON.stringify(txSigned));
    conn
      .postTransactionCommit(txSigned)
      .then((retrievedTx) => {
        resolve(retrievedTx.id);
      })
      .catch((err) => {
        reject(err);
        console.log(err);
      });
  });
};

exports.getTransactionById = (search) => {
  return new Promise((resolve, reject) => {
    const conn = new driver.Connection(API_PATH);
    console.log(conn);
    conn
      .getTransaction(search)
      .then((retrievedTx) => {
        resolve(retrievedTx);
      })
      .catch((err) => {
        reject(err);
        console.log(err);
      });
  });
};

exports.getTransactionId = (search) => {
  console.log(search);
  return new Promise((resolve, reject) => {
    const conn = new driver.Connection(API_PATH);
    console.log(conn);
    conn
      .searchMetadata(search)
      .then((retrievedTx) => {
        console.log(retrievedTx);
        retrievedTx = JSON.parse(JSON.stringify(retrievedTx));
        retrievedTx = retrievedTx.map((ele) => {
          return ele.id;
        });
        resolve(retrievedTx);
      })
      .catch((err) => {
        reject(err);
        console.log(err);
      });
  });
};

exports.burnRecord = (transactionId, private_key, metadata) => {
  console.log(transactionId, private_key);
  return new Promise((resolve, reject) => {
    const alice = new driver.Ed25519Keypair();
    const conn = new driver.Connection(API_PATH);
    // Get transaction payload by ID
    conn
      .getTransaction(transactionId)
      .then((txCreated) => {
        const BURN_ADDRESS = "BurnBurnBurnBurnBurnBurnBurnBurnBurnBurnBurn";
        console.log("txCreated  ", txCreated);
        const burnTransaction = driver.Transaction.makeTransferTransaction(
          // signedTx to transfer and output index
          [{ tx: txCreated, output_index: 0 }],

          [
            driver.Transaction.makeOutput(
              driver.Transaction.makeEd25519Condition(BURN_ADDRESS)
            ),
          ],

          // metadata
          { ...metadata, ...{ status: "BURNED" } }
        );
        console.log("burnTransaction  ", burnTransaction);
        const assetCreateTxSigned = driver.Transaction.signTransaction(
          burnTransaction,
          private_key
        );
        console.log("assetCreateTxSigned   ", assetCreateTxSigned);
        conn
          .postTransactionCommit(assetCreateTxSigned)
          .then((retrievedTx) => {
            resolve(retrievedTx.id);
          })
          .catch((err) => {
            reject(err);
            console.log("err -------------->", err);
          });
      })
      .catch((err) => {
        reject(err);
        console.log("err2 -------------->", err);
        console.log(err);
      });
  });
};

exports.transferTransaction = (transactionId, private_key, transferUser, metadata) => {
  console.log("transactionId----->", transactionId, private_key, transferUser);
  return new Promise((resolve, reject) => {
    const conn = new driver.Connection(API_PATH);
    // Get transaction payload by ID
    conn
      .getTransaction(transactionId)
      .then((txCreated) => {
        const PUBLICK_KEY = transferUser.public_key;
        console.log("txCreated  ", txCreated);
        const burnTransaction = driver.Transaction.makeTransferTransaction(
          // signedTx to transfer and output index
          [{ tx: txCreated, output_index: 0 }],

          [
            driver.Transaction.makeOutput(
              driver.Transaction.makeEd25519Condition(PUBLICK_KEY)
            ),
          ],

          // metadata
          { ...metadata, ...{ status: "TRANSFERED", user_id: transferUser._id } }
        );
        const assetCreateTxSigned = driver.Transaction.signTransaction(
          burnTransaction,
          private_key
        );
        console.log("assetCreateTxSigned   ", assetCreateTxSigned);
        conn
          .postTransactionCommit(assetCreateTxSigned)
          .then((retrievedTx) => {
            resolve(retrievedTx.id);
          })
          .catch((err) => {
            reject(err);
            console.log("err -------------->", err);
          });
      })
      .catch((err) => {
        reject(err);
        console.log("err2 -------------->", err);
        console.log(err);
      });
  });
};

exports.generateKeys = () => {
  const alice = new driver.Ed25519Keypair();
  return { public_key: alice.publicKey, private_key: alice.privateKey };
};
