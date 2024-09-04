# TS generated interfaces from protos

To regenerate `index.ts` (from the root of the repository):

```bash
npx protoc --ts_out packages/types-safety-web/ --proto_path . packages/types-safety-web/index.proto
```
