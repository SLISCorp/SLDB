from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify
from bigchaindb_driver import BigchainDB
bdb_root_url = 'http://127.0.0.1:9984'
bdb = BigchainDB(bdb_root_url)

# generate a keypair
from bigchaindb_driver.crypto import generate_keypair

app = Flask(__name__)
api = Api(app)

CORS(app)


@app.route("/")
def hello():
    return jsonify({'text': 'Hello World!'})


class Burn(Resource):
    def get(self, id):
        print('id:' + id)
        alice = generate_keypair()
        bob = generate_keypair()

        # retrieve transaction for the asset
        creation_tx = bdb.transactions.retrieve(id)
        print(creation_tx)
        #print  (creation_tx)
        # get trnsaction id for the trasaction of the asset
        asset_id = creation_tx['id']
        # append asset transaction id to the tx_ids list
        tx_ids = [asset_id]
        # get all transactions id for the asset

        transfer_asset = {
            'id': asset_id,
        }
        output_index = 0
        output = creation_tx['outputs'][output_index]
        # transfer_input should contain the last transfer transaction id for the asset from the list
        transfer_input = {
            'fulfillment': output['condition']['details'],
            'fulfills': {
                'output_index': output_index,
                'transaction_id': asset_id,
            },
            'owners_before': output['public_keys'],
        }

        prepared_transfer_tx = bdb.transactions.prepare(
            operation='TRANSFER',
            asset=transfer_asset,
            inputs=transfer_input,
            recipients='BurnBurnBurnBurnBurnBurnBurnBurnBurnBurnBurn')
        print(alice.private_key, bob.private_key)
        fulfilled_transfer_tx = bdb.transactions.fulfill(
            prepared_transfer_tx,
            private_keys='4vNxjA3wz2mzQyQbnZnmevKHmXEuftDrooivFNu8B6w3',
        )
        create_transaction = bdb.transactions.send_commit(
            fulfilled_transfer_tx)
        return jsonify(create_transaction)


api.add_resource(Burn, '/burn/<id>')  # Route_3

if __name__ == '__main__':
    app.run(port=5002)
