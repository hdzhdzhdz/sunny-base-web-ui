<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { computed, useSlots } from 'vue';

import { KunkkaScrollbar } from '@kunkka/ui';

import { SidebarCollapseButton, SidebarFixedButton } from './widgets';

interface Props {
  /**
   * 隐藏的dom是否可见
   * @default true
   */
  domVisible?: boolean;
  /**
   * 主题
   */
  theme: string;
  collapseHeight?: number;
  collapseWidth?: number;
  fixedExtra?: boolean;
  isSidebarMixed?: boolean;
  marginTop?: number;
  mixedWidth?: number;
  paddingTop?: number;
  show?: boolean;
  showCollapseButton?: boolean;
  showFixedButton?: boolean;
  zIndex?: number;
  width?: number;
  headerHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  collapseHeight: 42,
  collapseWidth: 48,
  domVisible: true,
  fixedExtra: false,
  isSidebarMixed: false,
  marginTop: 0,
  mixedWidth: 70,
  paddingTop: 0,
  show: true,
  showCollapseButton: true,
  showFixedButton: true,
  zIndex: 0,
});

const slots = useSlots();
const emit = defineEmits<{ leave: [] }>();

/** 侧边栏折叠状态 (true: 折叠, false: 展开) */
const collapse = defineModel<boolean>('collapse');

/** 鼠标悬停触发的临时展开状态 (true: 正在悬停展开中) */
const expandOnHovering = defineModel<boolean>('expandOnHovering');

/** 是否开启鼠标悬停自动展开功能 (true: 开启, false: 关闭/已固定) */
const expandOnHover = defineModel<boolean>('expandOnHover');

/**
 * 隐藏占位侧边栏样式
 * 用于在文档流中占位，保证主内容区域根据侧边栏宽度正确布局
 */
const hiddenSideStyle = computed((): CSSProperties => calcMenuWidthStyle(true));

const style = computed((): CSSProperties => {
  /**
   * marginTop: 侧边栏距离视口顶部的外边距，用于给头部区域腾出空间
   * paddingTop: 侧边栏内部顶部留白，控制内部内容的下移距离
   * zIndex: 侧边栏层级，避免被其它元素遮挡
   */
  const { marginTop, paddingTop, zIndex } = props;

  return {
    '--scroll-shadow': 'var(--sidebar)',
    ...calcMenuWidthStyle(false),
    height: `calc(100% - ${marginTop}px)`,
    marginTop: `${marginTop}px`,
    paddingTop: `${paddingTop}px`,
    zIndex,
  };
});

/**
 * 计算侧边栏宽度相关样式
 * isHiddenDom 为 true 时用于隐藏占位元素，为 false 时用于实际侧边栏
 */
function calcMenuWidthStyle(isHiddenDom: boolean): CSSProperties {
    /**
   * width: 主侧边栏基础宽度
   * show: 是否展示侧边栏，为 false 时整体向左偏移隐藏
   */
  const { show, width } = props;

  let widthValue =
    width === 0
      ? '0px'
      : `${width }px`;

  const { collapseWidth } = props;

  if (isHiddenDom && expandOnHovering.value && !expandOnHover.value) {
    widthValue = `${collapseWidth}px`;
  }

  return {
    ...(widthValue === '0px' ? { overflow: 'hidden' } : {}),
    flex: `0 0 ${widthValue}`,
    marginLeft: show ? 0 : `-${widthValue}`,
    maxWidth: widthValue,
    minWidth: widthValue,
    width: widthValue,
  };
}

/**
 * 处理鼠标移入事件
 * 用于在折叠状态下，鼠标悬停时自动展开侧边栏
 */
function handleMouseenter(e: MouseEvent) {
  // 避免鼠标从边缘快速划过或误触 (offsetX < 10px 时忽略)
  if (e?.offsetX < 10) {
    return;
  }

  // 如果侧边栏已被固定 (expandOnHover 为 true)，则不需要悬停展开逻辑，直接返回
  if (expandOnHover.value) {
    return;
  }
  // 如果当前未处于悬停展开状态，则取消折叠 (即展开侧边栏)
  if (!expandOnHovering.value) {
    collapse.value = false;
  }
  // 标记为正在悬停
  expandOnHovering.value = true;
}

/**
 * 处理鼠标移出事件
 * 鼠标离开时恢复折叠状态
 */
function handleMouseleave() {
  emit('leave');
  // 如果侧边栏已被固定，则鼠标离开时不自动折叠
  if (expandOnHover.value) {
    return;
  }
  // 恢复折叠状态，并重置悬停标记
  expandOnHovering.value = false;
  collapse.value = true;
}

const headerStyle = computed((): CSSProperties => {
  return {
    height: `${props.headerHeight}px`,
  };
});

/**
 * Menu 菜单滚动区域高度
 */
const contentStyle = computed((): CSSProperties => {
  const { collapseHeight, headerHeight } = props;
  return {
    // 计算内容区域高度：总高度 - 头部高度 - 底部折叠按钮区域高度
    height: `calc(100% - ${headerHeight + collapseHeight}px)`,
    paddingTop: '8px',
  };
});

/**
 * 底部折叠按钮区域的高度占位
 */
const collapseStyle = computed((): CSSProperties => {
  return {
    height: `${props.collapseHeight}px`,
  };
});

</script>

<template>
  <!-- 文档流中的隐藏占位侧边栏，用于撑开主内容区域 -->
  <div
    v-if="domVisible"
    :class="theme"
    :style="hiddenSideStyle"
    class="h-full transition-all duration-150"
  ></div>
  <!-- 实际可见的固定定位侧边栏 -->
  <aside
    :class="[
      theme,
      {
        'bg-sidebar-deep': isSidebarMixed,
        'border-r border-border bg-sidebar': !isSidebarMixed,
      },
    ]"
    :style="style"
    class="fixed left-0 top-0 h-full transition-all duration-150"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
  >
    <SidebarFixedButton
      v-if="!collapse && showFixedButton"
      v-model:expand-on-hover="expandOnHover"
    />
    <div v-if="slots.logo" :style="headerStyle">
      <slot name="logo"></slot>
    </div>
    <KunkkaScrollbar :style="contentStyle" shadow shadow-border>
      <slot></slot>
    </KunkkaScrollbar>

    <div :style="collapseStyle"></div>
    <SidebarCollapseButton
      v-if="showCollapseButton"
      v-model:collapsed="collapse"
    />
  </aside>
</template>

