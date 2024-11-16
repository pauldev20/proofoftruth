import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { RewardClaimed } from "../generated/schema"
import { RewardClaimed as RewardClaimedEvent } from "../generated/Contract/Contract"
import { handleRewardClaimed } from "../src/contract"
import { createRewardClaimedEvent } from "./contract-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let user = Address.fromString("0x0000000000000000000000000000000000000001")
    let voteId = BigInt.fromI32(234)
    let rewardAmount = BigInt.fromI32(234)
    let newRewardClaimedEvent = createRewardClaimedEvent(
      user,
      voteId,
      rewardAmount
    )
    handleRewardClaimed(newRewardClaimedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("RewardClaimed created and stored", () => {
    assert.entityCount("RewardClaimed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "RewardClaimed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "user",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "RewardClaimed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "voteId",
      "234"
    )
    assert.fieldEquals(
      "RewardClaimed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "rewardAmount",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
