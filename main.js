const CHAIN_ID = 1
const GAS_LIMIT = 21000
const LOCALSTORAGE_KEY_PRIIVATEKEY = "SEW_PRIVATEKEY"
const EthWallet = ethereumjs.Wallet
const EthUtil = ethereumjs.Util
const EthTx = ethereumjs.Tx

function getEthBalance(address) {
	window.web3js.eth.getBalance(address, (error, balance) => {
		if (error) {
			alert(error)
		} else {
			let ethBalance = window.web3js.fromWei(balance, 'ether')
			document.getElementById('balance').value = ethBalance
		}
  })
}

function showWalletInfo(wallet) {
	let address = wallet.getChecksumAddressString()
	let privateKey = wallet.getPrivateKeyString()
	document.getElementById('address').value = address
	document.getElementById('privatekey').value = privateKey
	getEthBalance(address)
}

// Save wallet onto local storage
function saveWallet(wallet) {
  const privateKeyString = wallet.getPrivateKeyString()
  localStorage.setItem(LOCALSTORAGE_KEY_PRIIVATEKEY, privateKeyString)
}

// Recover wallet from local storage
function recoverWallet() {
  const privateKeyString = localStorage.getItem(LOCALSTORAGE_KEY_PRIIVATEKEY)
  if(privateKeyString) {
  	const privateKeyBuffer = EthUtil.toBuffer(privateKeyString)
  	window.wallet = EthWallet.fromPrivateKey(privateKeyBuffer)
  	showWalletInfo(window.wallet)
  }
}

// Generate wallet
function generateWallet() {
	window.wallet = EthWallet.generate()
	saveWallet(window.wallet)
	showWalletInfo(window.wallet)
}

// Load wallet from private key
function loadWallet() {
	let privateKey = document.getElementById('privatekey').value
	let privateKeyBuffer = EthUtil.toBuffer(privateKey)
	window.wallet = EthWallet.fromPrivateKey(privateKeyBuffer)
	saveWallet(window.wallet)
	showWalletInfo(window.wallet)
}

function showTxResult(txHash) {
	let elm = document.getElementById('tx-result')
	elm.textContent = null	// remove child elements
	let link = '<a href="https://etherscan.io/tx/' + txHash + '" target="_blank">tx result</a>'
	elm.innerHTML = link
}

function getNonce(address, callback) {
	window.web3js.eth.getTransactionCount(address, function(error, result){
		if (error) {
			alert(error)
		} else {
			callback(result)
		}
	})
}

function sendRawTx(rawTx, callback) {
	window.web3js.eth.sendRawTransaction(rawTx, function(error, result){
		if (error) {
			alert(error)
		} else {
			callback(result)
		}
	})
}

function createTx(nonce, to, gasPrice, gasLimit, value) {
	const txParams = {
		nonce: window.web3js.toHex(nonce),
		to: to,
		gasPrice: window.web3js.toHex(gasPrice),
		gasLimit: window.web3js.toHex(gasLimit),
		value: window.web3js.toHex(value),
		chainId: CHAIN_ID
	}
	const tx = new EthTx(txParams)
	return tx
}

function sendEther() {
	const fromAddress = window.wallet.getAddressString()
	const toAddress = document.getElementById('to-address').value

	if(!EthUtil.isValidAddress(toAddress)) {
		alert("Enter a valid to-address.")
		return
	}

	const ethAmount = document.getElementById('to-amount').value
	const weiAmount = window.web3js.toWei(ethAmount, 'ether')

	if(weiAmount <= 0) {
		alert("Enter valid amount.")
		return
	}

	const gasPrice = document.getElementById('gas-price').value
	const weiGasPrice = window.web3js.toWei(gasPrice, 'gwei')

	getNonce(fromAddress, function(nonce) {
		const tx = createTx(nonce, toAddress, weiGasPrice, GAS_LIMIT, weiAmount)
		tx.sign(EthUtil.toBuffer(window.wallet.getPrivateKeyString()))
		const serializedTx = tx.serialize()
		const rawTx = '0x' + serializedTx.toString('hex')
		sendRawTx(rawTx, function(result) {
			alert("Tx has been sent.")
			showTxResult(result)
		})
	})
}

function togglePrivateKeyDisplay() {
	let elm = document.getElementById('privatekey')
	let type = elm.getAttribute('type')
	if (type == "password") {
		event.target.innerText = "Hide private key"
		elm.setAttribute('type', 'text')
	} else {
		event.target.innerText = "Show private key"
		elm.setAttribute('type', 'password')
	}	
}

window.onload = function () {
 	window.web3js = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/8c4f04c9ed3f4b9c87cfa2e4cea056ba"))
	const web3version = window.web3js.version.api
 	console.log("web3.js version: " + web3version) 
	recoverWallet()
}

