import {
  RewardClaimed as RewardClaimedEvent,
  UserRegistered as UserRegisteredEvent,
  VoteCreated as VoteCreatedEvent,
  VoteSubmitted as VoteSubmittedEvent,
} from "../generated/Contract/Contract";
import {
  RewardClaimed,
  UserRegistered,
  VoteCreated,
  VoteSubmitted,
  DailyAggregations,
} from "../generated/schema";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

function getDayId(timestamp: BigInt): string {
  const secondsInDay = BigInt.fromI32(86400);
  const day = timestamp.div(secondsInDay);
  return day.toString();
}

function getOrCreateDailyAggregations(dayId: string): DailyAggregations {
  let daily = DailyAggregations.load(dayId);
  if (daily == null) {
    daily = new DailyAggregations(dayId);
    daily.totalVotes = BigInt.zero();
    daily.totalRewards = BigInt.zero();
    daily.totalUsers = BigInt.zero();
    daily.save();
  }
  return daily;
}

function getOrCreateUser(userAddress: Bytes): UserRegistered {
  let user = UserRegistered.load(userAddress);
  if (user == null) {
    user = new UserRegistered(userAddress);
    user.nullifierHash = BigInt.zero();
    user.createdAtBlock = BigInt.zero();
    user.blockNumber = BigInt.zero();
    user.blockTimestamp = BigInt.zero();
    user.transactionHash = Bytes.empty();
    user.save();
  }
  return user;
}

// Handlers
export function handleRewardClaimed(event: RewardClaimedEvent): void {
  let entity = new RewardClaimed(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.user = getOrCreateUser(event.params.user).id;
  entity.voteId = event.params.voteId;
  entity.rewardAmount = event.params.rewardAmount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  // Daily aggregation
  let daily = getOrCreateDailyAggregations(getDayId(event.block.timestamp));
  daily.totalRewards = daily.totalRewards.plus(event.params.rewardAmount);
  daily.save();
}

export function handleUserRegistered(event: UserRegisteredEvent): void {
  let entity = getOrCreateUser(event.params.user);
  entity.nullifierHash = event.params.nullifierHash;
  entity.createdAtBlock = event.params.createdAtBlock;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  // Daily aggregation
  let daily = getOrCreateDailyAggregations(getDayId(event.block.timestamp));
  daily.totalUsers = daily.totalUsers.plus(BigInt.fromI32(1));
  daily.save();
}

export function handleVoteCreated(event: VoteCreatedEvent): void {
  let entity = new VoteCreated(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.voteId = event.params.voteId;
  entity.question = event.params.question;
  entity.startBlock = event.params.startBlock;
  entity.durationInBlocks = event.params.durationInBlocks;
  entity.status = "OPEN"; // Default status is OPEN

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleVoteSubmitted(event: VoteSubmittedEvent): void {
  let entity = new VoteSubmitted(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.user = getOrCreateUser(event.params.user).id;
  entity.voteId = event.params.voteId;
  entity.answerIndex = event.params.answerIndex;
  entity.stakeAmount = event.params.stakeAmount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  // Daily aggregation
  let daily = getOrCreateDailyAggregations(getDayId(event.block.timestamp));
  daily.totalVotes = daily.totalVotes.plus(BigInt.fromI32(1));
  daily.save();
}
