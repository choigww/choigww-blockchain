
############### Step 1. Building a Blockchain ###############
# Create  a Blockchain class whose constructor creates an initial empty list
# and another list to store transactions
# Blueprint for our class below.

# What does a Block look like?
# index + timestamp(Unix time) + list of transactions + proof + hash of the previous block
'''
block = {
    'index': 1,
    'timestamp': 1506057125.900785,
    'transactions': [
        {
            'sender': "8527147fe1f5426f9dd545de4b27ee00",
            'recipient': "a77f5cdfa2934df3954a5c7c7da5df1f",
            'amount': 5,
        }
    ],
    'proof': 324984774000,
    'previous_hash': "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
}
'''
# each new block contains within itself, the hash of the previous block
# THIS IS CRUCIAL BECUASE IT'S WHAT GIVES BLOCKCHAINS IMMUTABILITY:
# 	If an attacker corrupted an earlier Block in the chain then 
# 	all subsequent blocks will contain incorrect hashes

import hashlib
import json
from textwrap import dedent
from time import time
from uuid import uuid4

from flask import Flask, jsonify, request
from urllib.parse import urlparse
import requests

class Blockchain(object):
	def __init__(self):
		self.chain = []
		self.current_transactions = []

		# cheap way of ensuring that the addition of new nodes is idempotent
		# = "how many we add a specific node, it appears only once!"
		self.nodes = set()

		# create the genesis block
		self.new_block(previous_hash=1, proof = 100)

	
	############### Step 4. Consensus ###############
	# But the whole point of Blockchains is that they should be decentralized. 
	# And if they’re decentralized, how on earth do we ensure that they all reflect the same chain? 
	# This is called the problem of Consensus, and we’ll have to implement a Consensus Algorithm 
	# if we want more than one node in our network.

	# Register new Nodes
	# We need to a way to let a node know about neighbouring nodes on the network
	# Each node on our network should keep a registry of other nodes on the network
	# Thus we will need some more endpoints
	# 	1. /nodes/register, to accept a list of new nodes in the form of URLs
	#   2. /nodes/resolve, to implement our Consensus Algorithm,
	#      which resolves any conflicts - to ensure a node has the correct chain
	def register_node(self, address):
		'''
		Add a new node to the list of nodes

		:param address: <str> Address of node. Eg. 'http://192.168.0.5:5005'
		:return: None
		'''

		parsed_url = urlparse(address)
		self.nodes.add(parsed_url.netloc)


	def new_block(self, proof, previous_hash):
		'''
		Create a new Block in Blockchain
		
		:param proof: <int> The proof given the Proof of work algorithm
		:param previous_hash: (Optional) <str> Hash of previous Hash
		:return: <dict> New Block
		'''

		block = {
			'index' : len(self.chain) + 1,
			'timestamp' : time(),
			'transactions' : self.current_transactions,
			'proof' : proof,
			'previous_hash' : previous_hash or self.hash(self.chain[-1])
		}
		
		# Reset the current list of transactions
		self.current_transactions = []
		
		self.chain.append(block)
		return block
	

	# Adding Transactions to a Block
	# * We will need a way of adding transactions to a Block
	# * Our new_transaction() method is responsible for this
	def new_transaction(self, sender, recipient, amount):
		'''
		Creates a new transaction to go into the next mined Block

		:param sender: <str> Address of the Sender
		:param recipient: <str> Address of the Recipient
		:param amount: <int> Amount
		:return: <int> The index of the Block that will hold this transaction
		'''
		
		self.current_transactions.append({
			'sender': sender,
			'recipient': recipient,
			'amount': amount
		})

		return self.last_block['index'] + 1

	def proof_of_work(self, last_proof):
		'''
		Simple Proof of Work Algorithm:
		- Find a number p' such that hash(pp') contains leading 4 zeros,
		  where p is the previous p'
		- p is the previous proof, and p' is the new proof

		:param last_proof: <int>
		:return: <int>
		'''
		proof = 0
		while self.valid_proof(last_proof, proof) is False:
			proof += 1
		return proof


	# Implementing the Consensus Algorithm
	# "A conflict occurs when one node has a different chain to another"
	# RULE : the longest valid chain = de-facto (authorative/right)
	# Using this algorithm, we reach Consensus amongst the nodes in our network
	def valid_chain(self, chain):
		'''
		Determine if a given blockchain is valid
		
		:param chain: <list> A blockchain
		:return: <bool> True if valid, False if not
		'''

		# initialize start variables
		last_block = chain[0]
		current_index = 1

		while current_index < len(chain):
			block = chain[current_index]
			print(f'{last_block}')
			print(f'{block}')
			print("\n------------\n")
			# Check that the hash of the block is correct
			if block['previous_hash'] != self.hash(last_block):
				return False
			
			# Check that the Proof of work is correct
			if not self.valid_proof(last_block['proof'], block['proof']):
				return False

			last_block = block
			current_index += 1
		
		return True

	def resolve_conflicts(self):
		'''
		This is our Consensus Algorithm, it resolves conflicts
		by replacing our chain with the longest one in the network

		:return: <bool> True if our chain was replaced, False if not
		'''

		neighbours = self.nodes
		new_chain = None

		# We're only looking for chains longer than ours
		for node in neighbours:
			# download the chains of neighbouring nodes
			response = requests.get(f'http://{node}/chain')

			# Verify
			if response.status_code == 200:
				length = response.json()['length']
				chain = response.json()['chain']

				# Check if the length is longer and the chain is valid
				if length > max_length and self.valid_chain(chain):
					max_length = length
					new_chain = chain
		
		# Replace our chain 
		# if we discovered a new, valid chain longer than ours
		if new_chain:
			self.chain = new_chain
			return True
		
		return False



	@staticmethod
	def valid_proof(last_proof, proof):
		'''
		Validates the Proof: Does hash(last_proof, proof) contain 4 leading zeros?

		:param last_proof: <int> Previous Proof
		:param proof: <int> Current Proof
		:return: <bool> True if correct, False if not.
		'''

		guess = f'{last_proof}{proof}'.encode()
		guess_hash = hashlib.sha256(guess).hexdigest()
		return guess_hash[:4] == '0000'

	@staticmethod
	def hash(block):
		'''
		Creates a SHA-256 hash of a Block

		:param block: <dict> Block
		:return: <str>
		'''

		# We must make sure that the Dictionary is ordered,
		# or we will have inconsistent hashes
		block_string = json.dumps(block, sort_keys=True).encode()
		return hashlib.sha256(block_string).hexdigest()
		
	
	@property
	def last_block(self):
		# Returns the last Block in the chain
		return self.chain[-1]





############### Step 2. Our Blockchain as an API ###############
# We're going to use the Python Flask Framework. 
# It's a micro framework and it makes it easy to map endpoints to Python functions.
# This allows us talk to our blockchain over the web using HTTP requests.
# We will create three methods: 
#	* /transactions/new, to create a new transaction to a block
#	* /mine, to tell our server to mine a new Block
#	* /chain, to return the full Blockchain


# instantiate our Node
# Read more about Flask at the link below
# http://flask.pocoo.org/docs/0.12/quickstart/#a-minimal-application

app = Flask(__name__)

# Generate a globally unique address for this node
node_identifier = str(uuid4()).replace('-', '')

# Instantiate the Blockchains
blockchain = Blockchain()

# Create the /mine endpoint (GET request)
@app.route('/mine', methods = ['GET'])
def mine():
	# We run the proof of work algorithms to get the next proof
	last_block = blockchain.last_block
	last_proof = last_block['proof']
	proof = blockchain.proof_of_work(last_proof)
	
	# We must receive a reward for finding the proof
	# The sender is "0" to signify that this node has mined a new coin
	# Note that the recipient of the mined block = the (global) address of our node
	blockchain.new_transaction(
		sender="0",
		recipient=node_identifier,
		amount=1
	)

	# Forge the new Block by adding it to the chain
	previous_hash = blockchain.hash(last_block)
	block = blockchain.new_block(proof, previous_hash)

	response = {
		'message': "New Block Forged",
		'index': block['index'],
		'transactions': block['transactions'],
		'proof': block['proof'],
		'previous_hash': block['previous_hash']

	}

	return jsonify(response), 200

	
# Create the /transactions/new endpoint (POST request since we send data to it)
@app.route('/transactions/new', methods=['POST'])
def new_transaction():
	values = request.get_json()

	# Check that the required fields are in the POST'ed data
	required = ['sender', 'recipient', 'amount']
	if not all(k in values for k in required):
		return 'Missing values', 400

	# Create a new Transaction and store the currently last index number to 'index'
	index = blockchain.new_transaction(values['sender'],
										values['recipient'],
										values['amount'])

	response = {'message': f'Transaction will be added to Block {index}'}
	return jsonify(response), 201

# Create /chain endpoint to return the full Blockchain
@app.route('/chain', methods=['GET'])
def full_chain():
	response = {
		'chain' : blockchain.chain,
		'length' : len(blockchain.chain)
	}
	return jsonify(response), 200


@app.route('/nodes/register', methods=['POST'])
def register_nodes():
	values = request.get_json()

	nodes = values.get('nodes')
	if nodes is None:
		return "Error: Please supply a valid list of nodes", 400

	for node in nodes:
		blockchain.register_node(node)

	response = {
		'message': 'New nodes have been added',
		'total_nodes': list(blockchain.nodes)
	}
	return jsonify(response), 201


@app.route('/nodes/resolve', methods=['GET'])
def consensus():
	replaced = blockchain.resolve_conflicts()

	if replaced:
		response = {
			'message': 'Our chain was replaced',
			'new_chain': blockchain.chain
		}
	else:
		response = {
			'message': 'Our chain is authorative',
			'chain': blockchain.chain
		}

	return jsonify(response), 200

# Run the server on port 5005
if __name__ == '__main__':
	#app.run(host='127.0.0.1', port=5005)
	from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument('-p', '--port', default=5005, type=int, help='port to listen on')
    args = parser.parse_args()
    port = args.port

    app.run(host='127.0.0.1', port=port)

# The Transactions Endpoint Example
'''
{
	"sender" : "my address",
	"recipient" : "someone else's address",
	"amount" : 5
}
'''








