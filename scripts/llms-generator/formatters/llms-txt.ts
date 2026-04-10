import type { ComponentInfo, CategoryInfo } from '../types';
import { CATEGORY_LABELS } from '../component-scanner';

/**
 * 生成 llms.txt 精简索引
 */
export function formatLlmsTxt(components: ComponentInfo[], docsBaseUrl: string): string {
  const lines: string[] = [];

  lines.push('# Sunny Base Web Framework - Component Library');
  lines.push('> Vue 3 business component library built on Arco Design Vue');
  lines.push('>');
  lines.push('> Auto-generated from source code. Do not edit manually.');
  lines.push(`> Generated: ${new Date().toISOString().split('T')[0]}`);
  lines.push('');
  lines.push('## Introduction');
  lines.push('- [AI Resources](/resources/ai)');
  lines.push('');
  lines.push('## Base Library (Arco Design Vue)');
  lines.push('> Our UI library is based on Arco Design Vue.');
  lines.push('- [Arco LLM Index](/arco-llm.txt)');
  lines.push('- [Arco LLM Full Docs](/arco-llms-full.txt)');
  lines.push('');

  // 按分类分组
  const categories = groupByCategory(components);

  for (const cat of categories) {
    const label = CATEGORY_LABELS[cat.key] || cat.key;
    lines.push(`## ${label}`);

    for (const comp of cat.components) {
      const shortName = comp.name.replace(/^Sunny/, '');
      const kebabName = kebabCase(shortName);
      const desc = comp.description || shortName;
      lines.push(`- [${comp.name}](/components/${cat.key}/${kebabName}): ${desc}`);
    }

    lines.push('');
  }

  lines.push('## Full API Reference');
  lines.push('- [Complete Component API Documentation](/llms-full.txt)');
  lines.push('');

  return lines.join('\n');
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

function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}
