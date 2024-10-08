// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// @generated by protobuf-ts 2.9.4
// @generated from protobuf file "packages/types-safety-web/index.proto" (package "safety_web", syntax proto3)
// tslint:disable
import type {BinaryWriteOptions} from '@protobuf-ts/runtime';
import type {IBinaryWriter} from '@protobuf-ts/runtime';
import {WireType} from '@protobuf-ts/runtime';
import type {BinaryReadOptions} from '@protobuf-ts/runtime';
import type {IBinaryReader} from '@protobuf-ts/runtime';
import {UnknownFieldHandler} from '@protobuf-ts/runtime';
import type {PartialMessage} from '@protobuf-ts/runtime';
import {reflectionMergePartial} from '@protobuf-ts/runtime';
import {MessageType} from '@protobuf-ts/runtime';
// These messages are not stable and may still be changed in a breaking way
// while we figure out what's useful.

/**
 * @generated from protobuf message safety_web.Violation
 */
export interface Violation {
  /**
   * @generated from protobuf field: string message = 1;
   */
  message: string;
  /**
   * @generated from protobuf field: string rule_id = 2;
   */
  ruleId: string;
  /**
   * @generated from protobuf field: string file_path = 3;
   */
  filePath: string;
  /**
   * @generated from protobuf field: int32 line = 4;
   */
  line: number;
  /**
   * @generated from protobuf field: int32 column = 5;
   */
  column: number;
  /**
   * @generated from protobuf field: int32 end_line = 6;
   */
  endLine: number;
  /**
   * @generated from protobuf field: int32 end_column = 7;
   */
  endColumn: number;
  /**
   * @generated from protobuf field: string justification = 8;
   */
  justification: string;
  /**
   * A clickable URL that opens the file in e.g. VSCode
   *
   * @generated from protobuf field: string filesystem_url = 9;
   */
  filesystemUrl: string;
  /**
   * A clickable URL that opens the file in e.g. GitHub in the browser
   *
   * @generated from protobuf field: string web_url = 10;
   */
  webUrl: string;
  /**
   * @generated from protobuf field: string snippet = 11;
   */
  snippet: string;
}
/**
 * Return value of safety-web formatted with eslint-formatter-safety-web
 *
 * @generated from protobuf message safety_web.Summary
 */
export interface Summary {
  /**
   * @generated from protobuf field: string cwd = 1;
   */
  cwd: string;
  /**
   * @generated from protobuf field: repeated safety_web.Violation safety_web_violations = 2;
   */
  safetyWebViolations: Violation[];
  /**
   * @generated from protobuf field: repeated safety_web.Violation safety_web_silenced_violations = 3;
   */
  safetyWebSilencedViolations: Violation[];
  /**
   * ESLint violations not related to the safety-web plugin
   *
   * @generated from protobuf field: repeated safety_web.Violation other_violations = 4;
   */
  otherViolations: Violation[];
  /**
   * @generated from protobuf field: repeated safety_web.Violation other_silenced_violations = 5;
   */
  otherSilencedViolations: Violation[];
  /**
   * @generated from protobuf field: int32 safety_web_violation_count = 6;
   */
  safetyWebViolationCount: number;
  /**
   * @generated from protobuf field: int32 safety_web_silenced_violation_count = 7;
   */
  safetyWebSilencedViolationCount: number;
  /**
   * @generated from protobuf field: int32 other_violation_count = 8;
   */
  otherViolationCount: number;
  /**
   * @generated from protobuf field: int32 other_silenced_violation_count = 9;
   */
  otherSilencedViolationCount: number;
}
/**
 * @generated from protobuf message safety_web.Package
 */
export interface Package {
  /**
   * @generated from protobuf field: string name = 1;
   */
  name: string;
  /**
   * @generated from protobuf field: string relative_path = 2;
   */
  relativePath: string;
  /**
   * @generated from protobuf field: string version = 3;
   */
  version: string;
  /**
   * @generated from protobuf field: safety_web.Summary safety_web_summary = 4;
   */
  safetyWebSummary?: Summary;
  /**
   * @generated from protobuf field: string outcome = 5;
   */
  outcome: string;
}
/**
 * @generated from protobuf message safety_web.PackageManager
 */
export interface PackageManager {
  /**
   * @generated from protobuf field: string kind = 1;
   */
  kind: string;
  /**
   * @generated from protobuf field: string version = 2;
   */
  version: string;
}
/**
 * An invocation of the pipeline on 1 repository. Captures characteristics found
 * while analyzing and installing the repository.
 *
 * @generated from protobuf message safety_web.Repository
 */
export interface Repository {
  /**
   * @generated from protobuf field: string url = 1;
   */
  url: string;
  /**
   * @generated from protobuf field: safety_web.PackageManager package_manager_found = 3;
   */
  packageManagerFound?: PackageManager;
  /**
   * @generated from protobuf field: safety_web.PackageManager package_manager_used = 4;
   */
  packageManagerUsed?: PackageManager;
  /**
   * @generated from protobuf field: repeated safety_web.Package packages = 5;
   */
  packages: Package[];
  /**
   * @generated from protobuf field: string logs = 6;
   */
  logs: string;
  /**
   * When the repository fails to be set up, record the failing step.
   *
   * @generated from protobuf field: string step_failure = 7;
   */
  stepFailure: string;
}
// @generated message type with reflection information, may provide speed optimized methods
class Violation$Type extends MessageType<Violation> {
  constructor() {
    super('safety_web.Violation', [
      {no: 1, name: 'message', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
      {no: 2, name: 'rule_id', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
      {no: 3, name: 'file_path', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
      {no: 4, name: 'line', kind: 'scalar', T: 5 /*ScalarType.INT32*/},
      {no: 5, name: 'column', kind: 'scalar', T: 5 /*ScalarType.INT32*/},
      {no: 6, name: 'end_line', kind: 'scalar', T: 5 /*ScalarType.INT32*/},
      {no: 7, name: 'end_column', kind: 'scalar', T: 5 /*ScalarType.INT32*/},
      {
        no: 8,
        name: 'justification',
        kind: 'scalar',
        T: 9 /*ScalarType.STRING*/,
      },
      {
        no: 9,
        name: 'filesystem_url',
        kind: 'scalar',
        T: 9 /*ScalarType.STRING*/,
      },
      {no: 10, name: 'web_url', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
      {no: 11, name: 'snippet', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
    ]);
  }
  create(value?: PartialMessage<Violation>): Violation {
    const message = globalThis.Object.create(this.messagePrototype!);
    message.message = '';
    message.ruleId = '';
    message.filePath = '';
    message.line = 0;
    message.column = 0;
    message.endLine = 0;
    message.endColumn = 0;
    message.justification = '';
    message.filesystemUrl = '';
    message.webUrl = '';
    message.snippet = '';
    if (value !== undefined)
      reflectionMergePartial<Violation>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Violation,
  ): Violation {
    let message = target ?? this.create(),
      end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* string message */ 1:
          message.message = reader.string();
          break;
        case /* string rule_id */ 2:
          message.ruleId = reader.string();
          break;
        case /* string file_path */ 3:
          message.filePath = reader.string();
          break;
        case /* int32 line */ 4:
          message.line = reader.int32();
          break;
        case /* int32 column */ 5:
          message.column = reader.int32();
          break;
        case /* int32 end_line */ 6:
          message.endLine = reader.int32();
          break;
        case /* int32 end_column */ 7:
          message.endColumn = reader.int32();
          break;
        case /* string justification */ 8:
          message.justification = reader.string();
          break;
        case /* string filesystem_url */ 9:
          message.filesystemUrl = reader.string();
          break;
        case /* string web_url */ 10:
          message.webUrl = reader.string();
          break;
        case /* string snippet */ 11:
          message.snippet = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: Violation,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* string message = 1; */
    if (message.message !== '')
      writer.tag(1, WireType.LengthDelimited).string(message.message);
    /* string rule_id = 2; */
    if (message.ruleId !== '')
      writer.tag(2, WireType.LengthDelimited).string(message.ruleId);
    /* string file_path = 3; */
    if (message.filePath !== '')
      writer.tag(3, WireType.LengthDelimited).string(message.filePath);
    /* int32 line = 4; */
    if (message.line !== 0) writer.tag(4, WireType.Varint).int32(message.line);
    /* int32 column = 5; */
    if (message.column !== 0)
      writer.tag(5, WireType.Varint).int32(message.column);
    /* int32 end_line = 6; */
    if (message.endLine !== 0)
      writer.tag(6, WireType.Varint).int32(message.endLine);
    /* int32 end_column = 7; */
    if (message.endColumn !== 0)
      writer.tag(7, WireType.Varint).int32(message.endColumn);
    /* string justification = 8; */
    if (message.justification !== '')
      writer.tag(8, WireType.LengthDelimited).string(message.justification);
    /* string filesystem_url = 9; */
    if (message.filesystemUrl !== '')
      writer.tag(9, WireType.LengthDelimited).string(message.filesystemUrl);
    /* string web_url = 10; */
    if (message.webUrl !== '')
      writer.tag(10, WireType.LengthDelimited).string(message.webUrl);
    /* string snippet = 11; */
    if (message.snippet !== '')
      writer.tag(11, WireType.LengthDelimited).string(message.snippet);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(
        this.typeName,
        message,
        writer,
      );
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message safety_web.Violation
 */
export const Violation = new Violation$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Summary$Type extends MessageType<Summary> {
  constructor() {
    super('safety_web.Summary', [
      {no: 1, name: 'cwd', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
      {
        no: 2,
        name: 'safety_web_violations',
        kind: 'message',
        repeat: 1 /*RepeatType.PACKED*/,
        T: () => Violation,
      },
      {
        no: 3,
        name: 'safety_web_silenced_violations',
        kind: 'message',
        repeat: 1 /*RepeatType.PACKED*/,
        T: () => Violation,
      },
      {
        no: 4,
        name: 'other_violations',
        kind: 'message',
        repeat: 1 /*RepeatType.PACKED*/,
        T: () => Violation,
      },
      {
        no: 5,
        name: 'other_silenced_violations',
        kind: 'message',
        repeat: 1 /*RepeatType.PACKED*/,
        T: () => Violation,
      },
      {
        no: 6,
        name: 'safety_web_violation_count',
        kind: 'scalar',
        T: 5 /*ScalarType.INT32*/,
      },
      {
        no: 7,
        name: 'safety_web_silenced_violation_count',
        kind: 'scalar',
        T: 5 /*ScalarType.INT32*/,
      },
      {
        no: 8,
        name: 'other_violation_count',
        kind: 'scalar',
        T: 5 /*ScalarType.INT32*/,
      },
      {
        no: 9,
        name: 'other_silenced_violation_count',
        kind: 'scalar',
        T: 5 /*ScalarType.INT32*/,
      },
    ]);
  }
  create(value?: PartialMessage<Summary>): Summary {
    const message = globalThis.Object.create(this.messagePrototype!);
    message.cwd = '';
    message.safetyWebViolations = [];
    message.safetyWebSilencedViolations = [];
    message.otherViolations = [];
    message.otherSilencedViolations = [];
    message.safetyWebViolationCount = 0;
    message.safetyWebSilencedViolationCount = 0;
    message.otherViolationCount = 0;
    message.otherSilencedViolationCount = 0;
    if (value !== undefined)
      reflectionMergePartial<Summary>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Summary,
  ): Summary {
    let message = target ?? this.create(),
      end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* string cwd */ 1:
          message.cwd = reader.string();
          break;
        case /* repeated safety_web.Violation safety_web_violations */ 2:
          message.safetyWebViolations.push(
            Violation.internalBinaryRead(reader, reader.uint32(), options),
          );
          break;
        case /* repeated safety_web.Violation safety_web_silenced_violations */ 3:
          message.safetyWebSilencedViolations.push(
            Violation.internalBinaryRead(reader, reader.uint32(), options),
          );
          break;
        case /* repeated safety_web.Violation other_violations */ 4:
          message.otherViolations.push(
            Violation.internalBinaryRead(reader, reader.uint32(), options),
          );
          break;
        case /* repeated safety_web.Violation other_silenced_violations */ 5:
          message.otherSilencedViolations.push(
            Violation.internalBinaryRead(reader, reader.uint32(), options),
          );
          break;
        case /* int32 safety_web_violation_count */ 6:
          message.safetyWebViolationCount = reader.int32();
          break;
        case /* int32 safety_web_silenced_violation_count */ 7:
          message.safetyWebSilencedViolationCount = reader.int32();
          break;
        case /* int32 other_violation_count */ 8:
          message.otherViolationCount = reader.int32();
          break;
        case /* int32 other_silenced_violation_count */ 9:
          message.otherSilencedViolationCount = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: Summary,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* string cwd = 1; */
    if (message.cwd !== '')
      writer.tag(1, WireType.LengthDelimited).string(message.cwd);
    /* repeated safety_web.Violation safety_web_violations = 2; */
    for (let i = 0; i < message.safetyWebViolations.length; i++)
      Violation.internalBinaryWrite(
        message.safetyWebViolations[i],
        writer.tag(2, WireType.LengthDelimited).fork(),
        options,
      ).join();
    /* repeated safety_web.Violation safety_web_silenced_violations = 3; */
    for (let i = 0; i < message.safetyWebSilencedViolations.length; i++)
      Violation.internalBinaryWrite(
        message.safetyWebSilencedViolations[i],
        writer.tag(3, WireType.LengthDelimited).fork(),
        options,
      ).join();
    /* repeated safety_web.Violation other_violations = 4; */
    for (let i = 0; i < message.otherViolations.length; i++)
      Violation.internalBinaryWrite(
        message.otherViolations[i],
        writer.tag(4, WireType.LengthDelimited).fork(),
        options,
      ).join();
    /* repeated safety_web.Violation other_silenced_violations = 5; */
    for (let i = 0; i < message.otherSilencedViolations.length; i++)
      Violation.internalBinaryWrite(
        message.otherSilencedViolations[i],
        writer.tag(5, WireType.LengthDelimited).fork(),
        options,
      ).join();
    /* int32 safety_web_violation_count = 6; */
    if (message.safetyWebViolationCount !== 0)
      writer.tag(6, WireType.Varint).int32(message.safetyWebViolationCount);
    /* int32 safety_web_silenced_violation_count = 7; */
    if (message.safetyWebSilencedViolationCount !== 0)
      writer
        .tag(7, WireType.Varint)
        .int32(message.safetyWebSilencedViolationCount);
    /* int32 other_violation_count = 8; */
    if (message.otherViolationCount !== 0)
      writer.tag(8, WireType.Varint).int32(message.otherViolationCount);
    /* int32 other_silenced_violation_count = 9; */
    if (message.otherSilencedViolationCount !== 0)
      writer.tag(9, WireType.Varint).int32(message.otherSilencedViolationCount);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(
        this.typeName,
        message,
        writer,
      );
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message safety_web.Summary
 */
export const Summary = new Summary$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Package$Type extends MessageType<Package> {
  constructor() {
    super('safety_web.Package', [
      {no: 1, name: 'name', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
      {
        no: 2,
        name: 'relative_path',
        kind: 'scalar',
        T: 9 /*ScalarType.STRING*/,
      },
      {no: 3, name: 'version', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
      {no: 4, name: 'safety_web_summary', kind: 'message', T: () => Summary},
      {no: 5, name: 'outcome', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
    ]);
  }
  create(value?: PartialMessage<Package>): Package {
    const message = globalThis.Object.create(this.messagePrototype!);
    message.name = '';
    message.relativePath = '';
    message.version = '';
    message.outcome = '';
    if (value !== undefined)
      reflectionMergePartial<Package>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Package,
  ): Package {
    let message = target ?? this.create(),
      end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* string name */ 1:
          message.name = reader.string();
          break;
        case /* string relative_path */ 2:
          message.relativePath = reader.string();
          break;
        case /* string version */ 3:
          message.version = reader.string();
          break;
        case /* safety_web.Summary safety_web_summary */ 4:
          message.safetyWebSummary = Summary.internalBinaryRead(
            reader,
            reader.uint32(),
            options,
            message.safetyWebSummary,
          );
          break;
        case /* string outcome */ 5:
          message.outcome = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: Package,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* string name = 1; */
    if (message.name !== '')
      writer.tag(1, WireType.LengthDelimited).string(message.name);
    /* string relative_path = 2; */
    if (message.relativePath !== '')
      writer.tag(2, WireType.LengthDelimited).string(message.relativePath);
    /* string version = 3; */
    if (message.version !== '')
      writer.tag(3, WireType.LengthDelimited).string(message.version);
    /* safety_web.Summary safety_web_summary = 4; */
    if (message.safetyWebSummary)
      Summary.internalBinaryWrite(
        message.safetyWebSummary,
        writer.tag(4, WireType.LengthDelimited).fork(),
        options,
      ).join();
    /* string outcome = 5; */
    if (message.outcome !== '')
      writer.tag(5, WireType.LengthDelimited).string(message.outcome);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(
        this.typeName,
        message,
        writer,
      );
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message safety_web.Package
 */
export const Package = new Package$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PackageManager$Type extends MessageType<PackageManager> {
  constructor() {
    super('safety_web.PackageManager', [
      {no: 1, name: 'kind', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
      {no: 2, name: 'version', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
    ]);
  }
  create(value?: PartialMessage<PackageManager>): PackageManager {
    const message = globalThis.Object.create(this.messagePrototype!);
    message.kind = '';
    message.version = '';
    if (value !== undefined)
      reflectionMergePartial<PackageManager>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: PackageManager,
  ): PackageManager {
    let message = target ?? this.create(),
      end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* string kind */ 1:
          message.kind = reader.string();
          break;
        case /* string version */ 2:
          message.version = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: PackageManager,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* string kind = 1; */
    if (message.kind !== '')
      writer.tag(1, WireType.LengthDelimited).string(message.kind);
    /* string version = 2; */
    if (message.version !== '')
      writer.tag(2, WireType.LengthDelimited).string(message.version);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(
        this.typeName,
        message,
        writer,
      );
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message safety_web.PackageManager
 */
export const PackageManager = new PackageManager$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Repository$Type extends MessageType<Repository> {
  constructor() {
    super('safety_web.Repository', [
      {no: 1, name: 'url', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
      {
        no: 3,
        name: 'package_manager_found',
        kind: 'message',
        T: () => PackageManager,
      },
      {
        no: 4,
        name: 'package_manager_used',
        kind: 'message',
        T: () => PackageManager,
      },
      {
        no: 5,
        name: 'packages',
        kind: 'message',
        repeat: 1 /*RepeatType.PACKED*/,
        T: () => Package,
      },
      {no: 6, name: 'logs', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
      {no: 7, name: 'step_failure', kind: 'scalar', T: 9 /*ScalarType.STRING*/},
    ]);
  }
  create(value?: PartialMessage<Repository>): Repository {
    const message = globalThis.Object.create(this.messagePrototype!);
    message.url = '';
    message.packages = [];
    message.logs = '';
    message.stepFailure = '';
    if (value !== undefined)
      reflectionMergePartial<Repository>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Repository,
  ): Repository {
    let message = target ?? this.create(),
      end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* string url */ 1:
          message.url = reader.string();
          break;
        case /* safety_web.PackageManager package_manager_found */ 3:
          message.packageManagerFound = PackageManager.internalBinaryRead(
            reader,
            reader.uint32(),
            options,
            message.packageManagerFound,
          );
          break;
        case /* safety_web.PackageManager package_manager_used */ 4:
          message.packageManagerUsed = PackageManager.internalBinaryRead(
            reader,
            reader.uint32(),
            options,
            message.packageManagerUsed,
          );
          break;
        case /* repeated safety_web.Package packages */ 5:
          message.packages.push(
            Package.internalBinaryRead(reader, reader.uint32(), options),
          );
          break;
        case /* string logs */ 6:
          message.logs = reader.string();
          break;
        case /* string step_failure */ 7:
          message.stepFailure = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: Repository,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* string url = 1; */
    if (message.url !== '')
      writer.tag(1, WireType.LengthDelimited).string(message.url);
    /* safety_web.PackageManager package_manager_found = 3; */
    if (message.packageManagerFound)
      PackageManager.internalBinaryWrite(
        message.packageManagerFound,
        writer.tag(3, WireType.LengthDelimited).fork(),
        options,
      ).join();
    /* safety_web.PackageManager package_manager_used = 4; */
    if (message.packageManagerUsed)
      PackageManager.internalBinaryWrite(
        message.packageManagerUsed,
        writer.tag(4, WireType.LengthDelimited).fork(),
        options,
      ).join();
    /* repeated safety_web.Package packages = 5; */
    for (let i = 0; i < message.packages.length; i++)
      Package.internalBinaryWrite(
        message.packages[i],
        writer.tag(5, WireType.LengthDelimited).fork(),
        options,
      ).join();
    /* string logs = 6; */
    if (message.logs !== '')
      writer.tag(6, WireType.LengthDelimited).string(message.logs);
    /* string step_failure = 7; */
    if (message.stepFailure !== '')
      writer.tag(7, WireType.LengthDelimited).string(message.stepFailure);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(
        this.typeName,
        message,
        writer,
      );
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message safety_web.Repository
 */
export const Repository = new Repository$Type();
