const STORAGE_KEY = "SEW_MNEMONIC"
window.network = 'homestead'
window.provider = ethers.getDefaultProvider(window.network)

function loadBalance() {
	console.log("load ETH balance")
	window.provider.getBalance(window.wallet.address)
	.then((balance) => {
		let balanceInEth = ethers.utils.formatEther(balance)
		document.getElementById('balance').value = balanceInEth
	})
}

function showWalletInfo(wallet) {
	console.log("show wallet info")
	document.getElementById('address').value = wallet.address
	document.getElementById('mnemonic').value = wallet.mnemonic
	loadBalance()
}

function generateWallet() {
	console.log("generate wallet")
	window.wallet = new ethers.Wallet.createRandom()
	saveWallet(wallet)
	onWalletUpdate(window.wallet)
}

function saveWallet(wallet) {
	console.log("save wallet onto local storage")
  const mnemonic = wallet.mnemonic
  localStorage.setItem(STORAGE_KEY, mnemonic)
}

function recoverWallet() {
	console.log("recover wallet from local storage")
  const mnemonic = localStorage.getItem(STORAGE_KEY)
  if(mnemonic) {
  	try {
	  	window.wallet = ethers.Wallet.fromMnemonic(mnemonic)
  		onWalletUpdate(window.wallet)
	  } catch (e) {
	  	console.log("wallet recover failed")
			console.log(e)
			alert(e.message)
	  }
  } else {
  	console.log("no wallet found")
  }
}

function loadWallet() {
	console.log("load wallet from mnemonic")
	let mnemonic = document.getElementById('load-mnemonic').value
	if(mnemonic) {
		try {
			window.wallet = ethers.Wallet.fromMnemonic(mnemonic)
			saveWallet(wallet)
			onWalletUpdate(window.wallet)
		} catch (e) {
			console.log("wallet load failed")
			console.log(e)
			alert(e.message)
		}
  } else {
  	console.log("no mnemonic found")
  	alert("no mnemonic found")
  }
}

function showTxResult(txHash, network) {	
	let endpoint
	if (network == "homestead") {
		endpoint = "etherscan.io"
	} else {
		endpoint = `${network}.etherscan.io`
	}
	let url = `https://${endpoint}/tx/${txHash}`
	
	let a = document.createElement('a')
	a.innerHTML = url
	a.href = url
	a.target = "_blank"
	
	let li = document.createElement('li')
	li.appendChild(a)

	let ul = document.getElementById('tx-result')
	ul.insertBefore(li, ul.childNodes[0])
}

function sendEther() {
	const toAddress = document.getElementById('to-address').value
	const gasPrice = document.getElementById('gas-price').value
	const weiGasPrice = ethers.utils.parseUnits(gasPrice, 'Gwei')
	const ethAmount = document.getElementById('to-amount').value
	const weiAmount = ethers.utils.parseEther(ethAmount)

	if (!toAddress) { 
		console.log("no address found")
		return
	}

	const tx = {
		to: toAddress,
		gasPrice: ethers.utils.bigNumberify(weiGasPrice),
		value: weiAmount
	}

	window.wallet
	.connect(window.provider)
	.sendTransaction(tx)
	.then((txObj) => {
		console.log(txObj)
		document.getElementById('to-address').value = ""
		document.getElementById('to-amount').value = "0"
		showTxResult(txObj.hash, window.network)
	})
	.catch((e) => {
		console.log(e)
		alert(e.message)
	})
}

function toggleDisplay(key) {
	let elment = document.getElementById(key)
	let type = elment.getAttribute('type')
	if (type == 'password') {
		event.target.innerText = "hide"
		elment.setAttribute('type', 'text')
	} else {
		event.target.innerText = "show"
		elment.setAttribute('type', 'password')
	}	
}

function onNetworkUpdate() {
	console.log("network updated")
	window.network = event.target.options[event.target.selectedIndex].value
	window.provider = ethers.getDefaultProvider(window.network)
	onWalletUpdate(window.wallet)
}

function onWalletUpdate(wallet) {
	console.log("wallet updated")
	showWalletInfo(wallet)
}

window.onload = function () {
	recoverWallet()
}

