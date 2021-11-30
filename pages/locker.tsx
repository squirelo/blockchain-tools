import Head from 'next/head'
// import Image from 'next/image'
import { useRouter } from 'next/router'
import {
	TextField, Box, FormControl, FormLabel,
	Radio, RadioGroup, FormControlLabel,
	Button, Stack, LinearProgress
} from '@mui/material'
import { getMultiSenderAddress, getSigner } from '../backend/api/web3Provider'
import { btnTextTable, messagesTable, processRecipientData } from '../backend/api/utils'
import { Send as SendIcon } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { convertAmountsToWei, getErc20Approval, getErc20Contract, transferErc20 } from '../backend/api/erc20'
import TxnLink from '../components/TxnLink'
import { getErc721Approval, transferErc721 } from '../backend/api/erc721'
import { getErc1155Approval, transferErc1155 } from '../backend/api/erc1155'
import DateTimePicker from '@mui/lab/DateTimePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';


export default function Home() {

	const router = useRouter()

	const [tokenType, setTokenType] = useState('erc20')
	const [tokenAddress, setTokenAddress] = useState('')
	const [lockAmount, setLockAmount] = useState('')
	const [unlockDate, setUnlockDate] = useState(new Date())

	const [btnText, setBtnText] = useState(btnTextTable.LOCK)

	const [currChain, setCurrChain] = useState(-1)
	const [isNetworkSupported, setIsNetworkSupported] = useState(false)
	const [message1, setMessage1] = useState('')
	const [txnHash, setTxnHash] = useState('')


	useEffect(() => {
		async function loadWeb3() {
			if (!window.ethereum) {
				setMessage1(messagesTable.NOT_INSTALLED)
				return
			}

			window.ethereum.on('chainChanged', () => router.reload())

			const signer = getSigner()
			const chainId = await signer.getChainId()
			if (!getMultiSenderAddress(chainId)) {
				setMessage1(messagesTable.NOT_SUPPORTED)
				return
			}

			setIsNetworkSupported(true)
			setCurrChain(chainId)
		}
		loadWeb3()

	}, [])



	return (
		<div>
			<Head>
				<title>Locker</title>
				< meta name="description" content="Lock ERC20, ERC721, ERC1155 Tokens" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Box>
				<Stack mx='auto' spacing={3}
					maxWidth='400px'>

					<FormControl component="fieldset">
						<FormLabel component="legend">Token Type: </FormLabel>
						<RadioGroup
							row aria-label="gender"
							name="row-radio-buttons-group"
							value={tokenType}
							onChange={e => setTokenType(e.target.value)}
						>
							<FormControlLabel value="erc20" control={<Radio />} label="ERC20" />
							<FormControlLabel value="erc721" control={<Radio />} label="ERC721" />
							<FormControlLabel value="erc1155" control={<Radio />} label="ERC1155" />
						</RadioGroup>
					</FormControl>


					<TextField
						fullWidth
						id="standard-basic"
						label="Token Address"
						variant="standard"
						value={tokenAddress}
						onChange={e => setTokenAddress(e.target.value)}
					/>

					<TextField
						id="standard-basic"
						label="Lock Amount"
						variant="standard"
						value={lockAmount}
						onChange={e => setLockAmount(e.target.value)}
					/>


					<FormControl component="fieldset">

						<FormLabel component="legend">Unlock Date: </FormLabel>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<DateTimePicker
								renderInput={(params) => <TextField {...params} />}
								value={unlockDate}
								onChange={setUnlockDate}
							/>
						</LocalizationProvider>
					</FormControl>

					<Button
						disabled={(
							!isNetworkSupported
							|| btnText === btnTextTable.APPROVING
							|| btnText === btnTextTable.SENDING
						)}
						variant="contained" endIcon={<SendIcon />}>
						{btnText}
					</Button>
					{
						(btnText === btnTextTable.APPROVING || btnText === btnTextTable.SENDING) &&
						<LinearProgress />
					}

					<p>{message1}</p>

					{
						(txnHash.length > 0) &&
						<TxnLink
							chainId={currChain}
							txnHash={txnHash}
						/>
					}
				</Stack>
			</Box>
		</div>
	)
}
