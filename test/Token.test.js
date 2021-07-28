//all test will go here and then be run with truffle using mocha testing lib and chai assertion lib
const Token = artifacts.require('./Token')
require('chai').use(require('chai-as-promised')).should()

import {tokens,EVM_REVERT} from './helpers'


contract ('Token',([deployer,receiver])=>{ //here accounts are all the accounts in ganache
let token 
const name = 'Rich Token'
const symbol = 'RCH'
const decimals = '18'
const totalSupply = tokens(1000000).toString()



	//needed access to token in evry test so made this, runs before test starts
	beforeEach(async()=>{
		token = await Token.new()
	})


	describe('deployment', () =>{
		it('tracks tokens name', async()=>{
	//Reading token name and checking if its correct, to do that first we fetch contract,then call name func
		
		const result =  await token.name()
		result.should.equal(name)

		})

		it('tracks the symbol',async()=>{
			const result = await token.symbol()
			result.should.equal(symbol)
		})

		it('tracks the decimals',async()=>{
		const result = await token.decimals()
		result.toString().should.equal(decimals)	
		})

		it('tracks the total supply',async()=>{
			const result = await token.totalSupply()
			result.toString().should.equal(totalSupply.toString())
		})

		it('assigns total supply to the deployer', async()=>{
			const result = await token.balanceOf(deployer) //zero is account of deployer
			result.toString().should.equal(totalSupply.toString())
		})
	})

	describe('sending tokens',()=>{
		let result
		let amount

		describe('success',()=>{
			//put evrything in 'success' beacuse erc20 expect us to handle error in txn also'

		beforeEach(async()=>{
		amount = tokens(100)
		result = await token.transfer(receiver, amount, { from: deployer }) 
	})

		it('transfers tokens',async()=>{
			//now we need a receiver account so add it to callback function
			let balanceOf

			//the transfer
			//await token.transfer(receiver, tokens(100), { from: deployer }) //although transfer accept 2 arg, 3rd is to who is calling the function,part of metadata
			//because now sending amount number of tokens so commented out this

			//after transfer
			balanceOf = await token.balanceOf(deployer)
			balanceOf.toString().should.equal(tokens(999900).toString())
			//console.log("deployer balance after",balanceOf.toString())
			balanceOf = await token.balanceOf(receiver)
			balanceOf.toString().should.equal(tokens(100).toString())
			//console.log("receiver balance after",balanceOf.toString())

		})

		it('emits a transfer event',async() =>{
			//result variable will help us find if the event occured or not
			//console.log(result) //result contained info on event, receipt 
			//console.log(result.logs)
			const log = result.logs[0]
			log.event.should.eq('Transfer')
			const event = log.args
			event.from.toString().should.eq(deployer,'from value is correct')
			event.to.toString().should.eq(receiver,'to value is correct')
			event.value.toString().should.equal(amount.toString(),'value is correct') //checks if transfer was of tokens(100)
		})
		})

		describe('failure', () =>{
			it('rejects insufficient balances',async()=>{
				let invalidamount
				invalidamount = tokens(10000000) //100 million which is greater than supply hence invalid
				await token.transfer(receiver,invalidamount,{from: deployer}).should.be.rejectedWith(EVM_REVERT)
				//tried to transfer invalid amount of tokens so must be rejectes, duh!

				//try transfer when you have none
				invalidamount= tokens(10)
				await token.transfer(deployer,invalidamount,{from:receiver}).should.be.rejectedWith(EVM_REVERT)
			})
			it('rejects invalid recipients',async()=>{
				await token.transfer(0x0,amount,{from:deployer}).should.be.rejected//0x0 is blank/invalid address
			})
			})
		})

	
	})
