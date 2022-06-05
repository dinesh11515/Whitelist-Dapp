import Head from 'next/head';
import { useState,useRef,useEffect} from 'react'
import styles from '../styles/Home.module.css';
import {providers,Contract} from "ethers";
import Web3Modal from "web3modal";
import {abi,WHITELIST_CONTRACT_ADDRESS} from "../constants/index";

export default function Home() {
  const [joined,setJoined] = useState(false);
  const [walletConnect,setWalletConnect] = useState(false);
  const [loading,setLoading] = useState(false);
  const [numberOfWhitelisted,setNumberOfWhitelisted] = useState(0);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async(needSigner = false) =>{
      const provider = await web3ModalRef.current.connect();
      const web3provider = new providers.Web3Provider(provider);
      const {chainId} = await web3provider.getNetwork();
      if(chainId!=80001){
        alert("change to mumbai test");
        throw new error("change to mumbai test");
      }
      if(needSigner){
        return web3provider.getSigner();
      }
      return web3provider;
  }
  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getNumberOfWhitelisted();
      setJoined(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoined(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnect(true);
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  const renderButton = () => {
    if (walletConnect) {
      if (joined) {
        return (
          <div className='text-xl mb-8'>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className="text-base rounded bg-blue-600 text-white p-5">Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className="text-base rounded bg-blue-600 text-white p-5">
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className="text-base rounded bg-blue-600 text-white p-5">
          Connect your wallet
        </button>
      );
    }
  };

  useEffect(() => {
    if (!walletConnect) {
        web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnect]);


  return (
    <div className={styles.container}>
      <Head>
        <title>WhiteList Dapp</title>
        <meta name="description" content="created by Dinesh Aitham" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

        <div className='flex items-center justify-center mt-44 ml-32'>
          <div>
            <div className='font-bold text-3xl my-8'>Welcome to Crypto Devs!</div>
            <div className='text-xl my-8'>Its a nft Collections for developers in Crypto</div>
            <div className='text-xl mb-8'>{numberOfWhitelisted} have already joined the Whitelist </div>
            {renderButton()}
          </div>
          <div >
            <img src="./crypto-devs.svg" className='w-8/12 h-6/12 ml-40'></img>
          </div>
        </div>
    </div>
  )
}
