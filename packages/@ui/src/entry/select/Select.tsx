import { defineComponent, computed, watch, type PropType } from "vue";
import { Select, Option } from "@arco-design/web-vue";
import type { SelectOption } from "./types";

export default defineComponent({
  name: "SunnySelect",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number, Boolean, Object, Array] as PropType<
        | string
        | number
        | boolean
        | Record<string, any>
        | (string | number | boolean | Record<string, any>)[]
      >,
      default: undefined,
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      default: () => [],
    },
    filterModel: {
      type: Object as PropType<Record<string, any>>,
      default: undefined,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit, slots, attrs }) {
    // 判断选项是否可见
    const isOptionVisible = (option: SelectOption) => {
      // 1. 获取选项的元数据过滤条件
      const cMeta = option.cMeta;

      // 2. 如果选项没有定义 cMeta，视为通用选项，始终显示
      if (!cMeta || Object.keys(cMeta).length === 0) {
        return true;
      }

      // 3. 如果选项有 cMeta 限制，但外部没有提供 filterModel 上下文，
      // 则该选项不满足显示条件
      if (!props.filterModel || Object.keys(props.filterModel).length === 0) {
        return false;
      }

      // 4. 遍历 cMeta 中的所有条件，必须全部在 filterModel 中匹配
      return Object.entries(cMeta).every(([key, requiredValue]) => {
        const contextValue = props.filterModel![key];

        // 使用弱等于比较，兼容 string/number
        if (contextValue === undefined || contextValue === null) {
          return false;
        }

        return String(contextValue) === String(requiredValue);
      });
    };

    const validatedValue = computed(() => {
      const rawValue = props.modelValue;
      // 1. 如果当前没有选中值，直接返回
      if (rawValue === undefined || rawValue === null || rawValue === "") {
        return rawValue;
      }

      // 2. 如果允许创建条目（allow-create），则不进行过滤，直接返回原值
      if (attrs["allow-create"] === true || attrs["allow-create"] === "") {
        return rawValue;
      }

      // 3. 检查值是否在当前可见的 options 中有效
      const isValueValid = (val: any) => {
        return props.options.some((opt) => {
          // 必须是可见的选项
          if (!isOptionVisible(opt)) return false;

          // 3.1 基础值比较
          if (opt.value == val) return true;

          // 3.2 处理对象类型的 modelValue
          if (
            typeof val === "object" &&
            val !== null &&
            "value" in val &&
            opt.value == val.value
          ) {
            return true;
          }

          return false;
        });
      };

      // 4. 根据值的类型（单选/多选）返回有效值
      if (Array.isArray(rawValue)) {
        // 多选：过滤掉无效的值
        const validValues = rawValue.filter((val) => isValueValid(val));
        return validValues.length === rawValue.length ? rawValue : validValues;
      } else {
        // 单选：如果无效则返回 undefined (清空显示)
        return isValueValid(rawValue) ? rawValue : undefined;
      }
    });

    // 当 validatedValue 发生变化（即当前值失效）时，同步更新父组件的 modelValue
    watch(validatedValue, (newVal) => {
      if (newVal !== props.modelValue) {
        emit("update:modelValue", newVal);
      }
    });

    const handleUpdateValue = (val: any) => {
      emit("update:modelValue", val);
    };

    return () => (
      <Select
        {...attrs}
        modelValue={validatedValue.value}
        onUpdate:modelValue={handleUpdateValue}
      >
        {{
          default: () =>
            props.options.map((item) => {
              if (!isOptionVisible(item)) return null;
              return (
                <Option key={item.value} {...item}>
                  {{
                    default: () =>
                      slots.option ? slots.option({ data: item }) : item.label,
                  }}
                </Option>
              );
            }),
          ...Object.fromEntries(
            Object.entries(slots).filter(
              ([key]) => key !== "option" && key !== "default"
            )
          ),
        }}
      </Select>
    );
  },
});
