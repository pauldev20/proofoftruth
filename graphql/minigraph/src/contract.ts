import {
  RewardClaimed as RewardClaimedEvent,
  UserRegistered as UserRegisteredEvent,
  VoteCreated as VoteCreatedEvent,
  VoteSubmitted as VoteSubmittedEvent
} from "../generated/Contract/Contract"
import {
  RewardClaimed,
  UserRegistered,
  VoteCreated,
  VoteSubmitted
} from "../generated/schema"

export function handleRewardClaimed(event: RewardClaimedEvent): void {
  let entity = new RewardClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.voteId = event.params.voteId
  entity.rewardAmount = event.params.rewardAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUserRegistered(event: UserRegisteredEvent): void {
  let entity = new UserRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.nullifierHash = event.params.nullifierHash
  entity.createdAtBlock = event.params.createdAtBlock

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoteCreated(event: VoteCreatedEvent): void {
  let entity = new VoteCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.voteId = event.params.voteId
  entity.question = event.params.question
  entity.startBlock = event.params.startBlock
  entity.durationInBlocks = event.params.durationInBlocks

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoteSubmitted(event: VoteSubmittedEvent): void {
  let entity = new VoteSubmitted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.voteId = event.params.voteId
  entity.answerIndex = event.params.answerIndex
  entity.stakeAmount = event.params.stakeAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
