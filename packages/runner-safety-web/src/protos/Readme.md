# TS generated interfaces from protos

To regenerate `pipeline.ts`:

```bash
npx protoc --ts_out . --proto_path src/protos src/protos/pipeline.proto
```
