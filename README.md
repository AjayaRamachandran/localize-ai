<p align="center">
  <img src="./github-repo-assets/logo.svg"></img>
  <p align="center">
<img src="https://img.shields.io/badge/React-blue?logo=React">
<img src="https://img.shields.io/badge/Python-navy?logo=Python">
<img src="https://img.shields.io/badge/Lucide-darkred?logo=Lucide">
</p>
  <h1 align='center'><b>Democratize Compute.</b></h1>
  <p style="font-size: 16px;" align='center'>The future of AI is <i>locally hosted, power efficient, and available anywhere.</i></p>
</p>

### The Mission
Modern AI models are inefficient, costly, and centralized. As technology innovates, to the point where AI can disrupt enture industries, the power to access this intelligence remaining concentrated amongst just a few companies is potentially incredibly dangerous.

- (1) Individuals like you and me deserve the ability to use AI for free, and offline, while leveraging the advantages of running intelligent systems on-hardware, like learning about you and storing that information without the privacy concerns of all that data being stored on some server.

- (2) Flagship models are built for maximum intelligence, often at the expense of efficiency. To keep these services fast, companies like OpenAI and Anthropic scale up their infrasructure to house more and faster computers. These computers produce immense amounts of heat, which needs to be vapor-cooled with water, irreversibly turning it into steam.
  - This is unsustainable. We simply cannot continue to evolve AI in this way. AI systems will only become smarter and more commonplace, and our current infrastructure is on course to cause real environmental damage if we continue without change.

- (3) For many, API access to existing models is not affordable at scale -- this access will only continue to increase in cost as the models consume more energy and get smarter.

### The Solution

What we need is an AI revolution: a distributed network of effieient systems -- free, and private. LocalizeAI is the first step in that process.

This repository is currently just a way of hosting open-source llama.cpp models on-hardware, exposing said model via `localhost`, and interacting with that model in a React-based interface. This is already a powerful proof-of-concept, allowing private, free (albeit slow) AI access, without an internet connection. But I have bigger plans.

### The Roadmap

**Home AI Servers** || A potential future for localized AI is the idea of a Home AI server: a single "AI router" in a household with the compute power of a gaming PC that handles the requests of all devices, from the smartphone to the smart TV, in that household. This AI server would be able to run a solid-sized model like OpenAI's gpt-oss-20b, enabling flagship-level intelligence for free. The benefit of a single shared server is that household context can be shared, allowing for the model to act as a sort of "AI Butler" that knows each member personally.

**Crowdsourced AI Networks** || One level above that is the idea of an AI network, in which individuals donate compute to the community in exchange for credits that make their own requests higher on the queue. To make the system self-propagating, users need to be incentivized to contribute to the network (rather than just use their compute for themselves) so perhaps a monetization scheme could be implemented.

Of course, we aren't close to any of those milestones -- but it's interesting the kinds of possibilities that open up when you decentralize AI compute. LocalizeAI may one day become a blueprint for the future of compute -- today it is a fun side project. Download the repo and try it out yourself!