#!/usr/bin/env npx tsx
/**
 * LLM 文档自动生成脚本
 *
 * 从 @ui 组件库 TypeScript 源码自动提取 API 信息，
 * 生成 llms.txt（精简索引）和 llms-full.txt（完整 API 文档）。
 *
 * 用法:
 *   pnpm generate:llms              # 生成文档
 *   pnpm generate:llms --dry-run    # 输出到控制台（不写文件）
 *   pnpm generate:llms --check      # 检查文件是否需要更新
 */

import * as path from 'path';
import * as fs from 'fs';
import { scanComponents } from './llms-generator/component-scanner';
import { parseComponents } from './llms-generator/parser';
import { formatLlmsTxt } from './llms-generator/formatters/llms-txt';
import { formatLlmsFullTxt } from './llms-generator/formatters/llms-full-txt';
import type { GeneratorConfig } from './llms-generator/types';

// 解析命令行参数
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const check = args.includes('--check');

// 项目根目录
const rootDir = path.resolve(__dirname, '..');

const config: GeneratorConfig = {
  uiSrcDir: path.join(rootDir, 'packages/@ui/src'),
  outputDir: path.join(rootDir, 'docs/src/public'),
  docsBaseUrl: '/',
  categories: [
    { key: 'basic', label: 'Basic Components' },
    { key: 'data', label: 'Data Display' },
    { key: 'entry', label: 'Data Entry' },
    { key: 'feedback', label: 'Feedback' },
    { key: 'navigation', label: 'Navigation' },
    { key: 'layout', label: 'Layout' },
    { key: 'composite', label: 'Composite' },
  ],
};

function main(): void {
  console.log('🔍 Scanning components...');
  const components = scanComponents(config);
  console.log(`   Found ${components.length} components`);

  console.log('📋 Parsing type definitions...');
  parseComponents(components);

  // 统计
  const totalProps = components.reduce((sum, c) => sum + c.props.length, 0);
  const totalEvents = components.reduce((sum, c) => sum + c.events.length, 0);
  const totalHooks = components.reduce((sum, c) => sum + c.hooks.length, 0);
  console.log(`   Extracted ${totalProps} props, ${totalEvents} events, ${totalHooks} hooks`);

  console.log('📝 Generating documentation...');
  const llmsTxt = formatLlmsTxt(components, config.docsBaseUrl);
  const llmsFullTxt = formatLlmsFullTxt(components);

  if (dryRun) {
    console.log('\n========== llms.txt ==========\n');
    console.log(llmsTxt);
    console.log('\n========== llms-full.txt (first 2000 chars) ==========\n');
    console.log(llmsFullTxt.substring(0, 2000));
    console.log('\n... (truncated)');
    return;
  }

  const llmsTxtPath = path.join(config.outputDir, 'llms.txt');
  const llmsFullTxtPath = path.join(config.outputDir, 'llms-full.txt');

  if (check) {
    const existingLlms = fs.existsSync(llmsTxtPath) ? fs.readFileSync(llmsTxtPath, 'utf-8') : '';
    const existingFull = fs.existsSync(llmsFullTxtPath) ? fs.readFileSync(llmsFullTxtPath, 'utf-8') : '';

    const llmsUpToDate = existingLlms === llmsTxt;
    const fullUpToDate = existingFull === llmsFullTxt;

    if (llmsUpToDate && fullUpToDate) {
      console.log('✅ All generated files are up to date.');
    } else {
      console.log('❌ Generated files are out of date:');
      if (!llmsUpToDate) console.log('   - llms.txt needs update');
      if (!fullUpToDate) console.log('   - llms-full.txt needs update');
      process.exit(1);
    }
    return;
  }

  // 写入文件
  fs.writeFileSync(llmsTxtPath, llmsTxt, 'utf-8');
  console.log(`   ✅ Written ${llmsTxtPath} (${llmsTxt.length} bytes)`);

  fs.writeFileSync(llmsFullTxtPath, llmsFullTxt, 'utf-8');
  console.log(`   ✅ Written ${llmsFullTxtPath} (${llmsFullTxt.length} bytes)`);

  console.log('\n📊 Summary:');
  for (const comp of components) {
    const propsCount = comp.props.length;
    const eventsCount = comp.events.length;
    const hooksCount = comp.hooks.length;
    const details: string[] = [];
    if (propsCount) details.push(`${propsCount} props`);
    if (eventsCount) details.push(`${eventsCount} events`);
    if (hooksCount) details.push(`${hooksCount} hooks`);
    const detailStr = details.length > 0 ? ` (${details.join(', ')})` : '';
    console.log(`   ${comp.name}${detailStr}`);
  }

  console.log('\n✨ Done!');
}

main();
