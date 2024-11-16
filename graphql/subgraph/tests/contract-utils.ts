import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  RewardClaimed,
  UserRegistered,
  VoteCreated,
  VoteSubmitted
} from "../generated/Contract/Contract"

export function createRewardClaimedEvent(
  user: Address,
  voteId: BigInt,
  rewardAmount: BigInt
): RewardClaimed {
  let rewardClaimedEvent = changetype<RewardClaimed>(newMockEvent())

  rewardClaimedEvent.parameters = new Array()

  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam("voteId", ethereum.Value.fromUnsignedBigInt(voteId))
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "rewardAmount",
      ethereum.Value.fromUnsignedBigInt(rewardAmount)
    )
  )

  return rewardClaimedEvent
}

export function createUserRegisteredEvent(
  user: Address,
  nullifierHash: BigInt,
  createdAtBlock: BigInt
): UserRegistered {
  let userRegisteredEvent = changetype<UserRegistered>(newMockEvent())

  userRegisteredEvent.parameters = new Array()

  userRegisteredEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "nullifierHash",
      ethereum.Value.fromUnsignedBigInt(nullifierHash)
    )
  )
  userRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "createdAtBlock",
      ethereum.Value.fromUnsignedBigInt(createdAtBlock)
    )
  )

  return userRegisteredEvent
}

export function createVoteCreatedEvent(
  voteId: BigInt,
  question: string,
  startBlock: BigInt,
  durationInBlocks: BigInt
): VoteCreated {
  let voteCreatedEvent = changetype<VoteCreated>(newMockEvent())

  voteCreatedEvent.parameters = new Array()

  voteCreatedEvent.parameters.push(
    new ethereum.EventParam("voteId", ethereum.Value.fromUnsignedBigInt(voteId))
  )
  voteCreatedEvent.parameters.push(
    new ethereum.EventParam("question", ethereum.Value.fromString(question))
  )
  voteCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startBlock",
      ethereum.Value.fromUnsignedBigInt(startBlock)
    )
  )
  voteCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "durationInBlocks",
      ethereum.Value.fromUnsignedBigInt(durationInBlocks)
    )
  )

  return voteCreatedEvent
}

export function createVoteSubmittedEvent(
  user: Address,
  voteId: BigInt,
  answerIndex: BigInt,
  stakeAmount: BigInt
): VoteSubmitted {
  let voteSubmittedEvent = changetype<VoteSubmitted>(newMockEvent())

  voteSubmittedEvent.parameters = new Array()

  voteSubmittedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  voteSubmittedEvent.parameters.push(
    new ethereum.EventParam("voteId", ethereum.Value.fromUnsignedBigInt(voteId))
  )
  voteSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "answerIndex",
      ethereum.Value.fromUnsignedBigInt(answerIndex)
    )
  )
  voteSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "stakeAmount",
      ethereum.Value.fromUnsignedBigInt(stakeAmount)
    )
  )

  return voteSubmittedEvent
}
