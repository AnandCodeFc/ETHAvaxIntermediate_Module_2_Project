import { useState, useEffect } from "react";
import { ethers } from "ethers";
import debountyABI from "../artifacts/contracts/DeBountyManager.sol/DeBountyManager.json";

export default function DeBountyManagerApp() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [tasks, setTasks] = useState([]);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskBounty, setNewTaskBounty] = useState("");
  const [taskIdToAssign, setTaskIdToAssign] = useState("");
  const [taskIdToComplete, setTaskIdToComplete] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const abi = debountyABI.abi;

  useEffect(() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      getWallet();
    } else {
      console.log("Please install MetaMask!");
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (ethWallet && account) {
      getContract();
    }
  }, [ethWallet, account]);

  const getWallet = async () => {
    if (ethWallet) {
      try {
        const accounts = await ethWallet.request({ method: "eth_accounts" });
        handleAccounts(accounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    }
  };

  const handleAccounts = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccounts(accounts);
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const debountyContract = new ethers.Contract(contractAddress, abi, signer);
    setContract(debountyContract);
  };

  const getBalance = async () => {
    if (contract) {
      try {
        const contractBalance = await contract.balance();
        setBalance(ethers.utils.formatEther(contractBalance));
      } catch (error) {
        console.error("Error fetching contract balance:", error);
      }
    }
  };

  const getTasks = async () => {
    if (contract) {
      try {
        const taskCount = await contract.getTaskCount();
        const tasksArray = [];
        for (let i = 0; i < taskCount; i++) {
          const task = await contract.tasks(i);
          tasksArray.push(task);
        }
        setTasks(tasksArray);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }
  };

  const createTask = async () => {
    if (contract && newTaskDescription && newTaskBounty) {
      try {
        const bountyInWei = ethers.utils.parseEther(newTaskBounty);
        const tx = await contract.createTask(newTaskDescription, bountyInWei);
        await tx.wait();
        alert("Task created successfully!");
        getTasks();
        setNewTaskDescription("");
        setNewTaskBounty("");
      } catch (error) {
        console.error("Error creating task:", error);
      }
    }
  };

  const assignTask = async () => {
    if (contract && taskIdToAssign) {
      try {
        const tx = await contract.assignTask(taskIdToAssign);
        await tx.wait();
        alert("Task assigned successfully!");
        getTasks();
        setTaskIdToAssign("");
      } catch (error) {
        console.error("Error assigning task:", error);
      }
    }
  };

  const completeTask = async () => {
    if (contract && taskIdToComplete) {
      try {
        const tx = await contract.completeTask(taskIdToComplete);
        await tx.wait();
        alert("Task completed successfully!");
        getTasks();
        setTaskIdToComplete("");
      } catch (error) {
        console.error("Error completing task:", error);
      }
    }
  };

  const deposit = async () => {
    if (contract) {
      try {
        const amountInWei = ethers.utils.parseEther("1");
        const tx = await contract.deposit({ value: amountInWei });
        await tx.wait();
        alert("Deposited 1 ETH");
        getBalance();
      } catch (error) {
        console.error("Error depositing:", error);
      }
    }
  };

  const withdraw = async () => {
    if (contract) {
      try {
        const amountInWei = ethers.utils.parseEther("1");
        const tx = await contract.withdraw(amountInWei);
        await tx.wait();
        alert("Withdrew 1 ETH");
        getBalance();
      } catch (error) {
        console.error("Error withdrawing:", error);
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      console.log("Please connect to MetaMask.");
    } else {
      setAccount(accounts[0]);
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this Dapp.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Connect Wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
      getTasks();
    }

    return (
      <div>
        <p>Account: {account}</p>
        <p>Contract Balance: {balance} ETH</p>
        
        <div>
          <h3>Create a New Task</h3>
          <input
            type="text"
            placeholder="Task description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Bounty (ETH)"
            value={newTaskBounty}
            onChange={(e) => setNewTaskBounty(e.target.value)}
          />
          <button onClick={createTask}>Create Task</button>
        </div>
        
        <div>
          <h3>Assign Task</h3>
          <input
            type="number"
            placeholder="Task ID"
            value={taskIdToAssign}
            onChange={(e) => setTaskIdToAssign(e.target.value)}
          />
          <button onClick={assignTask}>Assign Task</button>
        </div>
        
        <div>
          <h3>Complete Task</h3>
          <input
            type="number"
            placeholder="Task ID"
            value={taskIdToComplete}
            onChange={(e) => setTaskIdToComplete(e.target.value)}
          />
          <button onClick={completeTask}>Complete Task</button>
        </div>
        
        <div>
          <h3>Deposit and Withdraw</h3>
          <button onClick={deposit}>Deposit 1 ETH</button>
          <button onClick={withdraw}>Withdraw 1 ETH</button>
        </div>
        
        <h3>Tasks</h3>
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>
              {task.description} - Bounty: {ethers.utils.formatEther(task.bounty)} ETH - 
              Assignee: {task.assignee} - Completed: {task.completed.toString()}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <main>
      <h1>Decentralized Task Manager Dapp</h1>
      {initUser()}
    </main>
  );
}
