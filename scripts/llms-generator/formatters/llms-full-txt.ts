import type { ComponentInfo, PropInfo, EventInfo, ExposeMethodInfo, SlotInfo, HookInfo, CategoryInfo } from '../types';
import { CATEGORY_LABELS } from '../component-scanner';

/**
 * 生成 llms-full.txt 完整 API 文档
 */
export function formatLlmsFullTxt(components: ComponentInfo[]): string {
  const lines: string[] = [];

  // 文件头
  lines.push('# Sunny Base Web Framework - Full Component API Reference');
  lines.push('');
  lines.push('> Auto-generated from TypeScript source code. Do not edit manually.');
  lines.push(`> Generated: ${new Date().toISOString().split('T')[0]}`);
  lines.push('>');
  lines.push('> This document contains the complete API reference for all @ui components.');
  lines.push('> For a concise index, see [llms.txt](/llms.txt).');
  lines.push('');
  lines.push('---');
  lines.push('');

  // 目录
  lines.push('## Table of Contents');
  lines.push('');
  const categories = groupByCategory(components);
  for (const cat of categories) {
    const label = CATEGORY_LABELS[cat.key] || cat.key;
    lines.push(`### ${label}`);
    for (const comp of cat.components) {
      lines.push(`- [${comp.name}](#${comp.name.toLowerCase()})`);
    }
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  // 每个组件的完整文档
  for (const cat of categories) {
    for (const comp of cat.components) {
      lines.push(formatComponentDoc(comp));
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * 格式化单个组件文档
 */
function formatComponentDoc(comp: ComponentInfo): string {
  const lines: string[] = [];

  // 标题和描述
  lines.push(`## ${comp.name}`);
  lines.push('');
  if (comp.description) {
    lines.push(comp.description);
    lines.push('');
  }

  // 分类和路径
  lines.push(`**Category:** ${comp.category} | **Path:** \`${comp.directory}\``);
  lines.push('');

  // Import 示例
  lines.push('### Import');
  lines.push('');
  lines.push('```typescript');
  if (comp.exportNames.length > 0) {
    const names = comp.exportNames.filter((n) => n !== '*types');
    const typeExports = comp.exportNames.includes('*types')
      ? ['// + all types from types.ts']
      : [];
    lines.push(`import { ${names.join(', ')} } from '@sunny-base-web/ui';`);
    if (typeExports.length) {
      lines.push(typeExports[0]);
    }
  } else {
    lines.push(`import { ${comp.name} } from '@sunny-base-web/ui';`);
  }
  lines.push('```');
  lines.push('');

  // Hooks
  if (comp.hooks.length > 0) {
    lines.push('### Hooks');
    lines.push('');
    for (const hook of comp.hooks) {
      lines.push(`#### \`${hook.name}\``);
      lines.push('');
      if (hook.description) {
        lines.push(hook.description);
        lines.push('');
      }
      lines.push('```typescript');
      lines.push(hook.signature);
      lines.push('```');
      lines.push('');
    }
  }

  // Props
  if (comp.props.length > 0) {
    lines.push('### Props');
    lines.push('');
    lines.push('| Prop | Type | Default | Required | Description |');
    lines.push('|------|------|---------|----------|-------------|');
    for (const prop of comp.props) {
      const type = formatTypeForTable(prop.type);
      const def = prop.defaultValue ? `\`${prop.defaultValue}\`` : '-';
      const req = prop.required ? 'Yes' : 'No';
      const desc = prop.deprecated ? `⚠️ **DEPRECATED** ${prop.description}` : prop.description;
      lines.push(`| \`${prop.name}\` | ${type} | ${def} | ${req} | ${desc} |`);
    }
    lines.push('');
  }

  // Events
  if (comp.events.length > 0) {
    lines.push('### Events');
    lines.push('');
    lines.push('| Event | Parameters | Description |');
    lines.push('|-------|-----------|-------------|');
    for (const event of comp.events) {
      lines.push(`| \`${event.name}\` | \`${event.parameters}\` | ${event.description} |`);
    }
    lines.push('');
  }

  // Slots
  if (comp.slots.length > 0) {
    lines.push('### Slots');
    lines.push('');
    lines.push('| Slot | Description |');
    lines.push('|------|-------------|');
    for (const slot of comp.slots) {
      lines.push(`| \`${slot.name}\` | ${slot.description} |`);
    }
    lines.push('');
  }

  // Expose Methods
  if (comp.exposeMethods.length > 0) {
    lines.push('### Expose Methods');
    lines.push('');
    lines.push('| Method | Signature | Description |');
    lines.push('|--------|-----------|-------------|');
    for (const method of comp.exposeMethods) {
      lines.push(`| \`${method.name}\` | \`${method.signature}\` | ${method.description} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * 格式化类型字符串用于表格
 */
function formatTypeForTable(type: string): string {
  // 截断过长的类型
  if (type.length > 80) {
    return `\`${type.substring(0, 77)}...\``;
  }
  return `\`${type}\``;
}

function groupByCategory(components: ComponentInfo[]): CategoryInfo[] {
  const map = new Map<string, CategoryInfo>();

  for (const comp of components) {
    if (!map.has(comp.category)) {
      map.set(comp.category, { key: comp.category, label: CATEGORY_LABELS[comp.category] || comp.category, components: [] });
    }
    map.get(comp.category)!.components.push(comp);
  }

  return Array.from(map.values());
}
