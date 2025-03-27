# TS generated interfaces from protos

To regenerate `index.ts` (from the root of the repository):

```bash
yarn workspace @safety-web/types exec protoc --ts_out . --proto_path . index.proto pipeline.proto
```
