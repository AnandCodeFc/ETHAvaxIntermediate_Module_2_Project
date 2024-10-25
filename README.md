# Metacrafters Project: Smart Contract Management

**Project Objective-** Develop a basic smart contract containing 2-3 functions, and integrate it with a frontend application to display the output of these functions.

# DeBountyManager DApp

## Overview

The **DeBountyManager** is a decentralized application (dApp) designed to manage tasks with associated bounties on the Ethereum blockchain. It allows users to create tasks, assign tasks, and complete tasks to earn bounties. This contract manages the entire workflow, from task creation to bounty distribution, all while ensuring transparency and security through smart contracts.

## Features

- **Task Creation**: Users can create tasks with descriptions and specify a bounty.
- **Task Assignment**: A task can be claimed by a user, becoming the task's assignee.
- **Task Completion**: The assignee can mark the task as completed and receive the associated bounty.
- **Deposit and Withdraw**: The contract owner can deposit funds to pay out bounties and withdraw excess funds.
- **Event Logging**: All major actions (task creation, assignment, completion, deposit, and withdrawal) are logged via events.

## Contract Details

```solidity
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
```

- **Contract Name**: `DeBountyManager`
- **Compiler Version**: `0.8.17`
- **License**: MIT

## Functions

### `createTask`
Creates a new task with a description and bounty.
- **Input**: `_description` (string), `_bounty` (uint)
- **Conditions**: Requires the contract balance to be greater than or equal to the bounty amount.
- **Event Emitted**: `TaskCreated`

### `assignTask`
Assigns a task to the caller.
- **Input**: `_taskId` (uint)
- **Conditions**: Task must not already have an assignee.
- **Event Emitted**: `TaskAssigned`

### `completeTask`
Marks a task as completed and transfers the bounty to the assignee.
- **Input**: `_taskId` (uint)
- **Conditions**: Caller must be the task's assignee, the task must not be completed, and the contract balance must be sufficient.
- **Event Emitted**: `TaskCompleted`

### `getTaskCount`
Returns the total number of tasks created.
- **Output**: (uint) - Total number of tasks.

### `deposit`
Allows the owner to deposit funds into the contract.
- **Conditions**: Only the contract owner can deposit.
- **Event Emitted**: `Deposit`

### `withdraw`
Allows the owner to withdraw a specified amount from the contract.
- **Input**: `_withdrawAmount` (uint)
- **Conditions**: Only the contract owner can withdraw, and the requested amount must not exceed the contract balance.
- **Event Emitted**: `Withdraw`
- **Errors**: Throws `InsufficientBalance` if the requested withdrawal amount exceeds the balance.

## Events

- `TaskCreated(uint taskId, address creator, string description, uint bounty)`: Emitted when a task is created.
- `TaskAssigned(uint taskId, address assignee)`: Emitted when a task is assigned.
- `TaskCompleted(uint taskId, address assignee)`: Emitted when a task is completed and the bounty is transferred.
- `Deposit(address sender, uint amount)`: Emitted when the owner deposits funds into the contract.
- `Withdraw(address owner, uint amount)`: Emitted when the owner withdraws funds from the contract.

## Error Handling

- **InsufficientBalance**: Triggered when the contract balance is insufficient for the requested withdrawal amount.

## How to Use

1. **Deploy the Contract**: Deploy the `DeBountyManager` contract on an Ethereum-compatible blockchain using your preferred development environment (e.g., Remix, Hardhat).
2. **Deposit Funds**: The owner must deposit funds into the contract to cover the bounties for the tasks.
3. **Create a Task**: Any user can create a task by providing a description and a bounty amount.
4. **Assign a Task**: A user can assign themselves to a task by calling the `assignTask` function.
5. **Complete a Task**: The assigned user completes the task to receive the bounty.
6. **Withdraw Funds**: The owner can withdraw any excess funds from the contract.

## Prerequisites

- **Ethereum Wallet**: Ensure you have a wallet like MetaMask set up.
- **Development Environment**: Use Remix, Hardhat, or Truffle for deploying and interacting with the contract.
- **Test Network**: It's recommended to test on a network like Ropsten or Rinkeby before deploying to the mainnet.

## Example

1. Deploy the contract and note the contract address.
2. Use the `deposit` function to add funds.
3. Call `createTask` with a task description and bounty.
4. A user can claim the task using `assignTask`.
5. Once the task is completed, the assignee calls `completeTask` to receive the bounty.
