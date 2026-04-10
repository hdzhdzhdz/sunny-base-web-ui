import { Project, SyntaxKind, type InterfaceDeclaration, type SourceFile, type JSDoc, type PropertySignature, type CallSignatureDeclaration } from 'ts-morph';
import type { ComponentInfo, PropInfo, EventInfo, ExposeMethodInfo, SlotInfo, HookInfo } from './types';
import * as path from 'path';

let project: Project | null = null;

function getProject(): Project {
  if (!project) {
    project = new Project({
      compilerOptions: {
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
      },
      skipAddingFilesFromTsConfig: true,
    });
  }
  return project;
}

/**
 * 解析所有组件的类型信息
 */
export function parseComponents(components: ComponentInfo[]): void {
  const proj = getProject();

  for (const comp of components) {
    // 解析 types.ts
    if (comp.typesPath) {
      const sourceFile = proj.addSourceFileAtPath(comp.typesPath);
      parseTypesFile(sourceFile, comp);
    }

    // 解析 hook 文件
    for (const hookPath of comp.hookPaths) {
      const sourceFile = proj.addSourceFileAtPath(hookPath);
      const hookInfo = parseHookFile(sourceFile, hookPath);
      if (hookInfo) {
        comp.hooks.push(hookInfo);
      }
    }

    // 如果没有 types.ts，尝试从 Vue 组件提取内联类型
    if (!comp.typesPath) {
      for (const compPath of comp.componentPaths) {
        if (compPath.endsWith('.vue') || compPath.endsWith('.tsx')) {
          parseInlineTypes(compPath, comp, proj);
        }
      }
    }
  }
}

/**
 * 解析 types.ts 文件
 */
function parseTypesFile(sourceFile: SourceFile, comp: ComponentInfo): void {
  const interfaces = sourceFile.getInterfaces();

  for (const iface of interfaces) {
    const name = iface.getName();

    if (name.endsWith('Props')) {
      comp.props.push(...parsePropsInterface(iface));
    } else if (name.endsWith('Emits')) {
      comp.events.push(...parseEmitsInterface(iface));
    } else if (name.endsWith('Expose')) {
      comp.exposeMethods.push(...parseExposeInterface(iface));
    } else if (name.endsWith('Slots')) {
      comp.slots.push(...parseSlotsInterface(iface));
    }
  }

  // 如果组件还没有描述，从 Props 接口的 JSDoc 获取
  if (!comp.description) {
    const propsIface = interfaces.find((i) => i.getName().endsWith('Props'));
    if (propsIface) {
      const docs = propsIface.getJsDocs();
      if (docs.length > 0) {
        const desc = docs[0].getDescription().trim();
        if (desc) comp.description = desc;
      }
    }
  }
}

/**
 * 解析 Props 接口
 */
function parsePropsInterface(iface: InterfaceDeclaration): PropInfo[] {
  const props: PropInfo[] = [];

  for (const prop of iface.getProperties()) {
    const propInfo = parseProperty(prop);
    if (propInfo) {
      props.push(propInfo);
    }
  }

  return props;
}

/**
 * 解析单个属性
 */
function parseProperty(prop: PropertySignature): PropInfo | null {
  const name = prop.getName();
  const typeNode = prop.getTypeNode();
  const typeStr = typeNode ? typeNode.getText() : prop.getType().getText();
  const hasQuestionToken = prop.hasQuestionToken();

  let description = '';
  let defaultValue: string | undefined;
  let deprecated = false;

  const docs = prop.getJsDocs();
  if (docs.length > 0) {
    const doc = docs[0];

    // 获取描述文本（非 tag 部分）
    description = doc.getDescription().trim();

    // 获取 @default tag
    for (const tag of doc.getTags()) {
      const tagName = tag.getTagName();
      if (tagName === 'default') {
        defaultValue = tag.getCommentText()?.trim();
      } else if (tagName === 'deprecated') {
        deprecated = true;
      } else if (tagName === 'description') {
        const descText = tag.getCommentText()?.trim();
        if (descText && !description) {
          description = descText;
        }
      }
    }

    // 检查描述中是否包含 @default (内联写法)
    if (!defaultValue) {
      const defaultMatch = description.match(/@default\s+(.+?)$/m);
      if (defaultMatch) {
        defaultValue = defaultMatch[1].trim();
        description = description.replace(/@default\s+.+?$/m, '').trim();
      }
    }
  }

  return {
    name,
    type: simplifyType(typeStr),
    description: cleanDescription(description),
    defaultValue,
    required: !hasQuestionToken,
    deprecated,
  };
}

/**
 * 解析 Emits 接口（call signature 模式）
 */
function parseEmitsInterface(iface: InterfaceDeclaration): EventInfo[] {
  const events: EventInfo[] = [];

  // 检查是否有 call signatures（如 `(e: 'click', payload: any) => void`）
  const callSignatures = iface.getCallSignatures();
  if (callSignatures.length > 0) {
    for (const sig of callSignatures) {
      const params = sig.getParameters();
      if (params.length < 1) continue;

      const firstParam = params[0];
      const firstParamType = firstParam.getTypeNode();
      if (!firstParamType) continue;

      // 从字符串字面量类型获取事件名
      const eventType = firstParamType.getText();
      const eventMatch = eventType.match(/['"](.+?)['"]/);
      if (!eventMatch) continue;

      const eventName = eventMatch[1];
      const restParams = params.slice(1).map((p) => {
        const pType = p.getTypeNode();
        const pName = p.getName();
        return `${pName}${pType ? ': ' + pType.getText() : ''}`;
      }).join(', ');

      // 从 JSDoc 获取描述
      let description = '';
      const docs = iface.getJsDocs();
      // Call signature 的 JSDoc 通常在接口级别
      // 尝试从注释中匹配事件相关的描述
      if (docs.length > 0) {
        for (const doc of docs) {
          const fullText = doc.getFullText();
          if (fullText.includes(`'${eventName}'`) || fullText.includes(`"${eventName}"`)) {
            description = doc.getDescription().trim();
            break;
          }
        }
      }

      events.push({
        name: eventName,
        parameters: restParams || 'void',
        description,
      });
    }
    return events;
  }

  // 回退：从属性模式提取事件（如 `onXxx?: () => void`）
  for (const prop of iface.getProperties()) {
    const name = prop.getName();
    let description = '';
    const docs = prop.getJsDocs();
    if (docs.length > 0) {
      description = docs[0].getDescription().trim();
    }

    const typeNode = prop.getTypeNode();
    const typeStr = typeNode ? typeNode.getText() : '';

    events.push({
      name,
      parameters: typeStr,
      description: cleanDescription(description),
    });
  }

  return events;
}

/**
 * 解析 Expose 接口
 */
function parseExposeInterface(iface: InterfaceDeclaration): ExposeMethodInfo[] {
  const methods: ExposeMethodInfo[] = [];

  for (const prop of iface.getProperties()) {
    const name = prop.getName();
    const typeNode = prop.getTypeNode();
    const typeStr = typeNode ? typeNode.getText() : prop.getType().getText();

    let description = '';
    const docs = prop.getJsDocs();
    if (docs.length > 0) {
      description = docs[0].getDescription().trim();
    }

    methods.push({
      name,
      signature: typeStr,
      description: cleanDescription(description),
    });
  }

  return methods;
}

/**
 * 解析 Slots 接口
 */
function parseSlotsInterface(iface: InterfaceDeclaration): SlotInfo[] {
  const slots: SlotInfo[] = [];

  for (const prop of iface.getProperties()) {
    const name = prop.getName();
    let description = '';
    const docs = prop.getJsDocs();
    if (docs.length > 0) {
      description = docs[0].getDescription().trim();
    }

    const typeNode = prop.getTypeNode();
    const typeStr = typeNode ? typeNode.getText() : '';

    slots.push({
      name,
      description: cleanDescription(description),
      props: typeStr ? simplifyType(typeStr) : undefined,
    });
  }

  // 处理索引签名插槽 [key: string]
  const indexSigs = iface.getIndexSignatures();
  for (const sig of indexSigs) {
    const typeStr = sig.getType().getText(sig);

    let description = '';
    const docs = sig.getJsDocs();
    if (docs.length > 0) {
      description = docs[0].getDescription().trim();
    }

    if (description) {
      slots.push({
        name: '[dynamic]',
        description: cleanDescription(description),
        props: simplifyType(typeStr),
      });
    }
  }

  return slots;
}

/**
 * 解析 Hook 文件
 */
function parseHookFile(sourceFile: SourceFile, filePath: string): HookInfo | null {
  // 查找导出的函数声明
  const exportFuncs = sourceFile.getFunctions().filter((f) => f.isExported());
  if (exportFuncs.length === 0) {
    // 查找 export const xxx = ...
    const exportVars = sourceFile.getVariableStatements().filter((v) => v.isExported());
    if (exportVars.length === 0) return null;

    const firstVar = exportVars[0];
    const declarations = firstVar.getDeclarations();
    if (declarations.length === 0) return null;

    const decl = declarations[0];
    const name = decl.getName();
    const typeNode = decl.getTypeNode();
    const init = decl.getInitializer();

    let description = '';
    const docs = firstVar.getJsDocs();
    if (docs.length > 0) {
      description = docs[0].getDescription().trim();
    }

    return {
      name,
      filePath: path.basename(filePath),
      signature: typeNode ? typeNode.getText() : (init ? init.getText().substring(0, 200) : ''),
      description: cleanDescription(description),
    };
  }

  const func = exportFuncs[0];
  const name = func.getName() || '';
  const params = func.getParameters().map((p) => {
    const pName = p.getName();
    const pType = p.getTypeNode()?.getText() || '';
    return `${pName}: ${pType}`;
  }).join(', ');
  const returnType = func.getReturnTypeNode()?.getText() || '';

  let description = '';
  const docs = func.getJsDocs();
  if (docs.length > 0) {
    description = docs[0].getDescription().trim();
  }

  return {
    name,
    filePath: path.basename(filePath),
    signature: `${name}(${params}): ${returnType}`,
    description: cleanDescription(description),
  };
}

/**
 * 从 Vue SFC 中提取内联类型
 */
function parseInlineTypes(compPath: string, comp: ComponentInfo, proj: Project): void {
  const content = require('fs').readFileSync(compPath, 'utf-8');

  // 提取 <script setup> 块
  const scriptMatch = content.match(/<script[^>]*lang="ts"[^>]*>([\s\S]*?)<\/script>/);
  if (!scriptMatch) return;

  const scriptContent = scriptMatch[1];

  // 提取 defineProps 的泛型参数或 withDefaults 包裹的类型
  const propsTypeMatch = scriptContent.match(
    /defineProps<(\w+Props?)>/
  ) || scriptContent.match(
    /withDefaults\(defineProps<(\w+Props?)>/
  );

  // 如果引用了外部类型但没有 types.ts，直接从 defineProps 提取
  const inlinePropsMatch = scriptContent.match(
    /defineProps<\{([^}]+)\}>/s
  );

  if (inlinePropsMatch) {
    // 简单解析内联 Props
    const propsText = inlinePropsMatch[1];
    const propLines = propsText.split('\n').filter((l: string) => l.trim());
    for (const line of propLines) {
      const propMatch = line.match(/(\w+)(\??):\s*(.+)/);
      if (propMatch) {
        comp.props.push({
          name: propMatch[1],
          type: propMatch[3].replace(/[;,]\s*$/, ''),
          description: '',
          required: !propMatch[2],
        });
      }
    }
  }
}

/**
 * 清理描述文本
 */
function cleanDescription(desc: string): string {
  return desc
    .replace(/\n\s*\*\s*/g, ' ') // 合并多行 JSDoc
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 简化类型字符串（去除多余路径）
 */
function simplifyType(typeStr: string): string {
  return typeStr
    .replace(/import\([^)]+\)\./g, '') // 去除 import(...) 前缀
    .trim();
}
