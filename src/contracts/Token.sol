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
	mapping(address => mapping(address =>uint256)) public allowance;//how many tokens the exchange is allowed to use

	//Events - log a change of state to the blockchain, eg transfer is an event with all data inside it
	event Transfer(address indexed from, address indexed to,uint256 value);//"indexed" provides us to call events for a particular address(eg provide events where we were reciever only)
	event Approval(address indexed owner, address indexed spender, uint256 value);

	constructor() public{
		totalSupply = 1000000 * (10**decimals); //10 raise to power decimals 
		balanceOf[msg.sender] = totalSupply; //send all tokens to the smart conntract publisher.msg is solidity created global variable
	}

	//Send tokens(deduct from sender, add to reciever,duh?!)
	function transfer (address _to , uint256 _value) public returns (bool success){
		require(balanceOf[msg.sender]>=_value);//stops execution of further lines if condition invalid, also if it fails it will refund unused gas!!!
		_transfer(msg.sender,_to,_value);
		
		return true;
	}
 
	function _transfer(address _from, address _to, uint256 _value) internal{
		//coming from transfer function after refactor
		require(_to!=address(0));//should not be an invalid address
		balanceOf[_from] = balanceOf[_from].sub(_value); //decrease senders balance
		balanceOf[_to] = balanceOf[_to].add(_value); //add it to receiver
		emit Transfer(_from,_to,_value); //"emit" is used to call events
	}

	//Approve tokens
	function approve(address _spender, uint256 _value) public returns (bool success){
		require(_spender!=address(0));
		allowance[msg.sender][_spender] = _value;
		emit Approval(msg.sender,_spender,_value);
		return true;
	}
	//Transfer from (actually allows dex to make the trade with tokens)
	function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
		require(_value<=balanceOf[_from]);//spender must've enough balance to send value amount of tokens
		require(_value<=allowance[_from][msg.sender]);//it must also be less than approved amount for the exchange
		allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
		_transfer(_from,_to,_value);
		return true;
	}
}