pragma solidity >=0.5.0;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Token {
	using SafeMath for uint;

	//variables
	string public name="Rich Token"; //using public solidity creates a function automatically
	string public symbol = "RCH";
	uint256 public decimals = 18;
	uint256 public totalSupply;

	//Tracking balances(storing data on blockchain)
	mapping(address => uint256) public balanceOf; //key value pair of address and balance integer 

	//Events - log a change of state to the blockchain, eg transfer is an event with all data inside it
	event Transfer(address indexed from, address indexed to,uint256 value);//"indexed" provides us to call events for a particular address(eg provide events where we were reciever only)


	constructor() public{
		totalSupply = 1000000 * (10**decimals); //10 raise to power decimals 
		balanceOf[msg.sender] = totalSupply; //send all tokens to the smart conntract publisher.msg is solidity created global variable
	}

	//Send tokens(deduct from sender, add to reciever,duh?!)
	function transfer (address _to , uint256 _value) public returns (bool success){
		require(balanceOf[msg.sender]>=_value);//stops execution of further lines if condition invalid, also if it fails it will refund unused gas!!!
		require(_to!=address(0));//should not be an invalid address
		balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value); //decrease senders balance
		balanceOf[_to] = balanceOf[_to].add(_value); //add it to receiver
		emit Transfer(msg.sender,_to,_value); //"emit" is used to call events
		return true;
	}
}