import { useMoralis, useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

// have a function to enter the lottery

export default function LotteryEntrance() {
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")


    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const dispatch = useNotification()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    const { runContractFunction: enterRaffle, isLoading, isFetching } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = (await getRecentWinner()).toString()

        ethers.utils.formatUnits(entranceFeeFromCall, "ether")
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function(tx){
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function (){
        dispatch({
            type: "info",
            message: "Transaction complete",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            Hi from lottery entrance
            {raffleAddress ? (
                <div className="">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching? <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div> 
                        : 
                        <div>Enter Raffle</div> }
                    </button>
                    <br/>
                    Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")}
                    <br/>
                    Players: {numPlayers}
                    <br/>
                    Recent Winner: {recentWinner}
                    <br/>
                </div>
            ) : (
                <div>No Raffle Address Deteched</div>
            )}
        </div>
    )
}
