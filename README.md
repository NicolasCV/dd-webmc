# Party of Two

An agent-native tabletop game. You play one character; an AI agent plays the other.
Its abilities are WebMCP tools, registered and unregistered from world state, so it is
*structurally* incapable of acting outside its character — including in what it can say.

Built for the OpenAI WebMCP Challenge.

## Running it

Requires Chrome 149+ with WebMCP enabled — `chrome://flags/#enable-webmcp-testing`,
or launch with `--enable-features=WebMCP`.

```sh
npm install
cp .env.example .env   # add your OPENAI_API_KEY
npx netlify dev        # http://localhost:8888
```

## Status

Iterations 0–1: tools register, the capability sheet reflects the live registry, and
the companion speaks only through typed speech acts. Rooms, dice, dynamic
registration, portraits and voice are still to come.
