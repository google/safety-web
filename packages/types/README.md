# TS generated interfaces from protos

To regenerate `index.ts` (from the root of the repository):

```bash
npx protoc --ts_out . --proto_path . packages/types/index.proto
```