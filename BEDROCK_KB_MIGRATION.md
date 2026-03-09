# Bedrock Knowledge Bases + RAG Migration Plan

> **Status:** Design document — no code changes. This outlines the path from the current prompt-injection approach to Bedrock Knowledge Bases with retrieval-augmented generation (RAG).

---

## Current Approach

BharatVani currently loads all 25 government scheme JSONs at Lambda cold start and injects **compact summaries** (name + benefit + helpline) into Claude's system prompt via the `{SCHEME_CONTEXT}` placeholder.

```
buildPrompt() in bedrock.mjs:
 → loadSchemes() — reads 25 JSONs from filesystem
 → schemeSummaries — maps each to "• Name (Hindi): Benefit. Helpline: X"
 → Replaces {SCHEME_CONTEXT} in system_prompt.txt with ~3KB of summaries
```

**This works well today** — 25 schemes produce ~3KB of prompt context, well within Claude's context window. The system prompt + schemes + history + live data totals ~5-8KB.

### Why It Won't Scale

| Schemes | Approx Context Size | Problem |
|---------|-------------------|---------|
| 25 | ~3 KB | ✅ Fine |
| 50 | ~6 KB | ⚠️ Starts competing with history/live data for context |
| 100+ | ~12 KB+ | ❌ Wastes tokens on irrelevant schemes every call |
| 500+ (all govt schemes) | ~60 KB+ | ❌ Exceeds practical context budget |

Every call pays the token cost for **all** scheme summaries, even if the user asks about weather.

---

## Proposed: Amazon Bedrock Knowledge Bases + RAG

### Architecture

```
Current:  User Query → [ALL 25 schemes injected] → Claude → Response
Proposed: User Query → [Retrieve top 3-5 relevant schemes] → Claude → Response
```

### How It Works

1. **Data Source**: Upload scheme JSONs to an S3 bucket (already done — `bharatvani-knowledge-base`)
2. **Knowledge Base**: Create a Bedrock Knowledge Base linked to the S3 data source
3. **Vector Store**: Bedrock automatically creates an OpenSearch Serverless collection, chunks+embeds the documents
4. **At Query Time**: Use `Retrieve` or `RetrieveAndGenerate` API to find only relevant schemes
5. **Inject Results**: Pass retrieved scheme details into Claude's prompt (instead of all 25)

### Code Changes Required

#### `bedrock.mjs`

```diff
- // Current: Load ALL schemes into prompt
- const schemes = await loadSchemes();
- const schemeSummaries = Object.values(schemes).map(s => ...);
- finalPrompt.replace('{SCHEME_CONTEXT}', schemeSummaries);

+ // Proposed: Retrieve RELEVANT schemes only
+ import { BedrockAgentRuntimeClient, RetrieveCommand } from '@aws-sdk/client-bedrock-agent-runtime';
+ 
+ const ragClient = new BedrockAgentRuntimeClient({ region: 'ap-south-1' });
+ 
+ async function retrieveRelevantSchemes(userQuery) {
+     const response = await ragClient.send(new RetrieveCommand({
+         knowledgeBaseId: process.env.KB_ID,
+         retrievalQuery: { text: userQuery },
+         retrievalConfiguration: {
+             vectorSearchConfiguration: {
+                 numberOfResults: 5
+             }
+         }
+     }));
+     return response.retrievalResults
+         .map(r => r.content.text)
+         .join('\n\n');
+ }
```

#### `template.yaml`

```yaml
# New: Bedrock KB IAM permission for Lambda
- Effect: Allow
  Action:
    - bedrock:Retrieve
    - bedrock:RetrieveAndGenerate
  Resource: !Sub 'arn:aws:bedrock:${AWS::Region}:${AWS::AccountId}:knowledge-base/*'

# New: Environment variable
KB_ID: !Ref BedrockKnowledgeBase
```

#### Knowledge Base Creation (one-time CLI)

```bash
aws bedrock-agent create-knowledge-base \
  --name bharatvani-schemes \
  --role-arn arn:aws:iam::ACCOUNT:role/BedrockKBRole \
  --knowledge-base-configuration '{
    "type": "VECTOR",
    "vectorKnowledgeBaseConfiguration": {
      "embeddingModelArn": "arn:aws:bedrock:ap-south-1::foundation-model/amazon.titan-embed-text-v2:0"
    }
  }' \
  --storage-configuration '{
    "type": "OPENSEARCH_SERVERLESS",
    "opensearchServerlessConfiguration": {
      "collectionArn": "...",
      "vectorIndexName": "bharatvani-schemes",
      "fieldMapping": {
        "vectorField": "embedding",
        "textField": "text",
        "metadataField": "metadata"
      }
    }
  }'
```

---

## Cost Analysis

| Component | Current Cost | With Bedrock KB |
|-----------|-------------|-----------------|
| Scheme loading | Free (filesystem read) | Free (cached retrieve) |
| Claude tokens | ~1500 tokens/call for scheme context | ~300-500 tokens/call (only relevant schemes) |
| OpenSearch Serverless | N/A | ~$0.24/hr (~$170/month minimum) |
| Titan Embeddings | N/A | ~$0.02 per 1M tokens (negligible) |
| **Net impact** | — | **Saves ~1000 tokens/call, costs ~$170/month infra** |

> [!WARNING]
> OpenSearch Serverless has a minimum cost of ~$170/month. This only makes sense at **scale** (5000+ daily calls) where the token savings exceed the infra cost. For the current MVP with 25 schemes, the prompt-injection approach is **more cost-effective**.

---

## Recommendation

| Stage | Approach | When to Switch |
|-------|----------|---------------|
| **MVP / Hackathon** | ✅ Current (prompt injection) | Now |
| **50+ schemes** | ➡️ Bedrock KB + RAG | When scheme count exceeds 50 |
| **Production at scale** | ➡️ Bedrock KB + caching | When daily calls exceed 5000 |

**For now, keep the current approach.** It's simpler, cheaper, and performs well at 25 schemes. Document this migration path for when the knowledge base grows.

---

## Migration Steps (When Ready)

1. [ ] Create IAM role for Bedrock KB with S3 read access
2. [ ] Create OpenSearch Serverless collection
3. [ ] Create Bedrock Knowledge Base with S3 data source
4. [ ] Sync the data source (initial embedding)
5. [ ] Add `@aws-sdk/client-bedrock-agent-runtime` to Lambda dependencies
6. [ ] Update `bedrock.mjs` to use `RetrieveCommand` for scheme queries
7. [ ] Keep current prompt injection as fallback for non-scheme queries
8. [ ] Add `KB_ID` env var to SAM template
9. [ ] Test with all 25 schemes via RAG
10. [ ] Compare response quality: prompt-injection vs RAG retrieval
11. [ ] Cutover once quality is validated
