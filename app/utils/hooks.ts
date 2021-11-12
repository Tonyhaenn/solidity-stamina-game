import { useState, useEffect, useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers';
//TODO: Figure out how to make this env dependent :/
const deployment = await import('../../deployments/hh/Stamina.json')

//TODO: FIgure out if / how this can be utilized.
//import { Stamina } from '../../typechain'
import { injected } from './connectors'
import AccountBalance from '../components/AccountBalance';

export function useEagerConnect() {
  const { activate, active } = useWeb3React()

  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        setTried(true)
      }
    })
  }, []) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true)
    }
  }, [tried, active])

  return tried
}

export function useInactiveListener(suppress: boolean = false) {
  const { active, error, activate } = useWeb3React()

  useEffect((): any => {
    const { ethereum } = window as any
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleConnect = () => {
        console.log("Handling 'connect' event")
        activate(injected)
      }
      const handleChainChanged = (chainId: string | number) => {
        console.log("Handling 'chainChanged' event with payload", chainId)
        activate(injected)
      }
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("Handling 'accountsChanged' event with payload", accounts)
        if (accounts.length > 0) {
          activate(injected)
        }
      }
      const handleNetworkChanged = (networkId: string | number) => {
        console.log("Handling 'networkChanged' event with payload", networkId)
        activate(injected)
      }

      ethereum.on('connect', handleConnect)
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('networkChanged', handleNetworkChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect)
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('networkChanged', handleNetworkChanged)
        }
      }
    }
  }, [active, error, suppress, activate])
}

export function useStaminaContract() {
  const { account, library, chainId  } = useWeb3React()
  
  const [staminaContract, setStamina] = useState(null);
  //TODO: This seems to run just once. Then the state above isn't preserved between renders
  // useMemo ? How do get it to update?
  useMemo( ()=>{
    if (!!account ) {
      const signer = library.getSigner(account);
      const StaminaInstance = new ethers.Contract(deployment.address, deployment.abi, signer )
      setStamina(StaminaInstance);
      return;
    }
    setStamina(null)
  }, [account, chainId, library])
  //Error because useEffect only runs conditionally?
  /*
  const [ currentRound, setCurrentRound ] = useState(null);
  useEffect(()=>{
    async () => {
      if(!!staminaContract){
        const r = await staminaContract.currentRound();
        setCurrentRound(r)
      }
      return
    }
    setCurrentRound(null)
  }, [])
  
  if(!!staminaContract){
    staminaContract['currentRoundVal'] = currentRound;
  }
  */
    
  

  return staminaContract;
}

