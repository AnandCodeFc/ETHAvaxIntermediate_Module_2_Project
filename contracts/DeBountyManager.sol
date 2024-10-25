// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract DeBountyManager {
    address payable public owner; 
    uint256 public balance; 

    constructor() {
        owner = payable(msg.sender);
    }

    struct Task {
        address creator;
        string description;
        uint bounty;
        bool completed;
        address assignee; 
    }

    Task[] public tasks;
    mapping(uint => address) public taskAssignees;

    event TaskCreated(uint taskId, address creator, string description, uint bounty);
    event TaskAssigned(uint taskId, address assignee);
    event TaskCompleted(uint taskId, address assignee);
    event Deposit(address sender, uint amount);
    event Withdraw(address owner, uint amount);

    function createTask(string memory _description, uint _bounty) public {
        require(balance >= _bounty, "Insufficient contract balance for bounty");
        tasks.push(Task({
            creator: msg.sender,
            description: _description,
            bounty: _bounty,
            completed: false,
            assignee: address(0)
        }));
        emit TaskCreated(tasks.length - 1, msg.sender, _description, _bounty);
    }

    function assignTask(uint _taskId) public {
        Task storage task = tasks[_taskId];
        require(task.assignee == address(0), "Task already assigned");
        task.assignee = msg.sender;
        taskAssignees[_taskId] = msg.sender;
        emit TaskAssigned(_taskId, msg.sender);
    }

    function completeTask(uint _taskId) public {
        Task storage task = tasks[_taskId];
        require(taskAssignees[_taskId] == msg.sender, "Only the assignee can complete the task");
        require(!task.completed, "Task already completed");
        require(balance >= task.bounty, "Contract balance insufficient for bounty payout");
        
        task.completed = true;
        balance -= task.bounty;
        payable(msg.sender).transfer(task.bounty);
        emit TaskCompleted(_taskId, msg.sender);
    }

    function getTaskCount() public view returns (uint) {
        return tasks.length;
    }

    function deposit() public payable {
        require(msg.sender == owner, "Not the owner of this contract");
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "Not the owner of this contract");
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({balance: balance, withdrawAmount: _withdrawAmount});
        }
        balance -= _withdrawAmount;
        owner.transfer(_withdrawAmount);
        emit Withdraw(msg.sender, _withdrawAmount);
    }
}
