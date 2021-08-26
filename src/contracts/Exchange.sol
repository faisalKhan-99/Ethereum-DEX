pragma solidity >=0.5.0;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Token.sol";

contract Exchange {
	using SafeMath for uint;

	address public feeAccount;//account that receives exchange fees
	uint256 public feePercent;
	address constant ETHER = address(0);//blank address for ether
	mapping(address => mapping(address=>uint256)) public tokens;//to track whose?howmuch?which token?


	//Events
	event Deposit(address token,address user, uint256 amount, uint256 balance);
	event Withdraw(address token,address user, uint256 amount, uint256 balance);

	constructor (address _feeAccount,uint256 _feePercent) public {
		feeAccount= _feeAccount;
		feePercent = _feePercent;
	}

	//creating a fallback function
	//reverts ether if it is by mistake sent to the smart contract address
	function() external{
		revert();
	}

	function depositEther() payable public{//to accpet ether as metadata has to be payable
	tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
	emit Deposit(ETHER,msg.sender,msg.value,tokens[ETHER][msg.sender]);
	}

	function withdrawEther (uint _amount) public{
		require(tokens[ETHER][msg.sender]>=_amount); //checks that you dont withdraw more than you have on exchange
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
		msg.sender.transfer(_amount);
		emit Withdraw(ETHER,msg.sender,_amount,tokens[ETHER][msg.sender]);
	} 

	function depositToken(address _token, uint256 _amount) public{
	//Dont allow ether deposits...
	require(_token != ETHER);

	//which token wanna deposit?
	//send tokens to this contract

	require(Token(_token).transferFrom(msg.sender,address(this),_amount));//this is this smart contract
	//how much?
	//track balance of excchange(manage deposits)
	tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount); //add amount to pre existing value, pass in token address, user address who is depositing
	
	//Emit event
	emit Deposit(_token,msg.sender,_amount,tokens[_token][msg.sender]);
	
	}

	function withdrawToken(address _token, uint256 _amount ) public{
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
		require(Token(_token).transfer(msg.sender,_amount));
	}

}