const Exchange  = artifacts.require('./Exchange')
const Token = artifacts.require('./Token')
require('chai').use(require('chai-as-promised')).should()

import {tokens,ether,EVM_REVERT,ETHER_ADDRESS} from './helpers'


contract ('Exchange',([deployer,feeAccount,user1])=>{ //feeaccount is 2nd one not the deployer account.user1 is a new account
let token
let exchange 
const feePercent = 10

	
	beforeEach(async()=>{
		///deploy token
		token = await Token.new()
		//deploy exchange
		exchange = await Exchange.new(feeAccount,feePercent)//passed it as an argument for the constrctor because we wanna set this account
		token.transfer(user1,tokens(100),{from:deployer})//give some tokens to user1
	})


	describe('deployment', () =>{
		it('tracks fee account', async()=>{
		
		const result =  await exchange.feeAccount()
		result.should.equal(feeAccount)
		

		})

		it('tracks fee percent', async()=>{
		
		const result =  await exchange.feePercent()
		result.toString().should.equal(feePercent.toString())
		

		})

		
		
	})

	describe('fallback', ()=>{
		it('reverts when ether is sent to SC',async()=>{
			await exchange.sendTransaction({value:1,from: user1}).should.be.rejectedWith(EVM_REVERT)
		})
	})

	describe('depositing ether', () =>{
		let result
		let amount = ether(1)

		beforeEach(async()=>{
			result = await exchange.depositEther({from: user1, value: amount})
		})

		it('tracks ether deposit', async () =>{
			const balance = await exchange.tokens(ETHER_ADDRESS,user1)
			balance.toString().should.equal(amount.toString())
		})
		it('emits a Deposit event',async() =>{
			//result variable will help us find if the event occured or not
			//console.log(result) //result contained info on event, receipt 
			//console.log(result.logs)
			const log = result.logs[0]
			log.event.should.eq('Deposit')
			const event = log.args
			event.token.toString().should.eq(ETHER_ADDRESS,'token address is correct')
			event.user.toString().should.eq(user1,'user is correct')
			event.amount.toString().should.equal(amount.toString(),'value is correct')
			event.balance.toString().should.equal(amount.toString(),'balance is correct')
		})
	})

	describe('withdrawing ether', () =>{
		let result 
		let amount

		beforeEach(async ()=>{
			amount = ether(1)
			await exchange.depositEther({from:user1,value:amount})
		})

		describe('success',async()=>{
			beforeEach(async()=>{
				result = await exchange.withdrawEther(amount,{from:user1})
			})
			it('withdraws all ether',async()=>{
				const balance = await exchange.tokens(ETHER_ADDRESS,user1)
				balance.toString().should.equal('0')
			})
			it('emits a Withdraw event',async() =>{
			//result variable will help us find if the event occured or not
			//console.log(result) //result contained info on event, receipt 
			//console.log(result.logs)
			const log = result.logs[0]
			log.event.should.eq('Withdraw')
			const event = log.args
			event.token.toString().should.eq(ETHER_ADDRESS,'token address is correct')
			event.user.toString().should.eq(user1,'user is correct')
			event.amount.toString().should.equal(amount.toString(),'value is correct')
			event.balance.toString().should.equal('0','balance is correct')
		})
		})
		describe('failure',async()=>{
			it('rejects withdraws for insufficient balances',async()=>{
				await exchange.withdrawEther(ether(100),{from:user1}).should.be.rejectedWith(EVM_REVERT)
			//it passes because we only deposited 1 ether and tried to take out 100
			})
		})

	})

	describe('depositing tokens', () =>{
		let result
		let amount 

	

		describe('success',async()=>{
			beforeEach(async()=>{
			amount = tokens(10)
			await token.approve(exchange.address,amount,{from: user1})
			result = await exchange.depositToken(token.address,amount,{from:user1})


		})//approve the token first to start the process
			it('tracks token deposit',async () =>{
				//check exchange token balance
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(amount.toString())
				//balance of token on exchange
				balance= await exchange.tokens(token.address,user1) //balance of this token for user1
				balance.toString().should.equal(amount.toString())
			})
			it('emits a Deposit event',async() =>{
			//result variable will help us find if the event occured or not
			//console.log(result) //result contained info on event, receipt 
			//console.log(result.logs)
			const log = result.logs[0]
			log.event.should.eq('Deposit')
			const event = log.args
			event.token.toString().should.eq(token.address,'token address is correct')
			event.user.toString().should.eq(user1,'user is correct')
			event.amount.toString().should.equal(amount.toString(),'value is correct')
			event.balance.toString().should.equal(amount.toString(),'balance is correct')
		})
		})
		describe('failure',async()=>{
			//dont approve any tokens before depositing
			it('fails when no tokens are approved',async()=>{
				await exchange.depositToken(token.address,tokens(10,{from:user1})).should.be.rejectedWith(EVM_REVERT)
			})
			it('rejects ether deposits',async()=>{
				await exchange.depositToken(ETHER_ADDRESS,tokens(10),{from:user1}).should.be.rejectedWith(EVM_REVERT)
			})
		})
		
		
	})

	describe('withDraw token',async()=>{
		let result
		let amount

		describe('success',async()=>{

			beforeEach(async()=>{
				amount = tokens(10)
				//deposit tokens first
				await token.approve(exchange.address,amount,{from:user1})
				await exchange.depositToken(token.address,amount,{from:user1})

				///withdrawing tokens
				result = await exchange.withdrawToken(token.address,amount,{from:user1})
			})

			it('withdraw token funds',async()=>{
				const balance = await exchange.tokens(token.address,user1)
				balance.toString().should.equal('0')
			})
			it('emits a Withdraw event',async() =>{
			//result variable will help us find if the event occured or not
			//console.log(result) //result contained info on event, receipt 
			//console.log(result.logs)
			const log = result.logs[0]
			log.event.should.eq('Withdraw')
			const event = log.args
			event.token.toString().should.eq(token.address,'token address is correct')
			event.user.toString().should.eq(user1,'user is correct')
			event.amount.toString().should.equal(amount.toString(),'value is correct')
			event.balance.toString().should.equal('0','balance is correct')
			})
			})
		describe('failure',async()=>{

			it('rejects ether withdraws',async()=>{
				await exchange.withdrawToken(ETHER_ADDRESS,tokens(10),{from:user1}).should.be.rejectedWith(EVM_REVERT)
			})
			it('rejects withdraws for insufficient balances',async()=>{
				await exchange.withdrawToken(token.address,tokens(10),{from:user1}).should.be.rejectedWith(EVM_REVERT)
			
			})

		})
	})

	describe('checking balance',async () =>{
		beforeEach(async()=>{
			exchange.depositEther({from:user1, value: ether(1)})
		})

		it('return user balance', async()=>{
			const result = await exchange.balanceOf(ETHER_ADDRESS,user1)
			result.toString().should.equal(ether(1).toString())
		})
	})
})