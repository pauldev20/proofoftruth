<div align="center">
	<img src="https://em-content.zobj.net/source/apple/419/crystal-ball_1f52e.png" align="center" width=180 heihgt=180/>
  <h1>ProofOfTruth</h1>
	<p align="center">
    <a href="https://ethglobal.com/showcase/proofoftruth-g31wn">ETHGlobal Showcase</a>
		<br/>
		<a href="#about">About This Project</a>
		·
		<a href="#how-it-works">How It Works</a>
  	</p>
	<br/>
</div>

<div align="center">
  <img width="385" height="279" alt="Screenshot 2025-08-16 at 00 38 50" src="https://github.com/user-attachments/assets/d280cd39-1070-43ba-afa5-d32cdcc954c8" />
</div>

<br/>

# About
Proof-of-Personhood Truth Oracle (think UMA but with WorldID)

# Description
UMA currently handles the resolution of multi-billion dollar Polymarket bets, yet the UMA token that underpins and secures the oracle has a market cap of only ~$200 million as of November 2024.

This imbalance introduces a significant risk for Polymarket users due to UMA’s stake-based governance (i.e., greater financial stake equates to more voting power), which makes it susceptible to potential exploitation by large token holders or "whales."

A more secure approach leverages the collective input of millions of unique humans worldwide to assert the truth of a statement through voting.

We have integrated WorldID and World Mini Apps to create a marketplace where proposers can submit questions they wish to verify in exchange for bounties, and World users can earn money by voting on the correct answers.

# How It Works
The project comprises a Mini App within the World App, an oracle contract deployed on Worldchain connected to the Mini App, and a self-hosted The Graph subgraph for indexing contract events and data. We also implemented and deployed a worldIdRegister and a Permit2Vault contract.

Together, these components allow the Mini App to:
- verify unique humans using WorldID.
- resolve questions with staking functionality.
- Permit2 approvals and transfers involving the World token.

The contract is deployed on Worldchain:
- 0x03d9858aa5c3a8e79560e833827e6a096643e061
