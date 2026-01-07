import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import settings from "./settings";

// 1. 合并 Reducers
const rootReducer = combineReducers({
  settings,
});

// 2. 配置持久化设置
const persistedReducer = persistReducer(
  {
    key: import.meta.env.VITE_APP_CURRENT_SYSTEM, // 持久化存储的 key, 优先从环境变量获取
    storage, // 使用 localStorage
    version: 1, // 版本号
    blacklist: [], // 黑名单：不需要持久化的数据状态 key
  },
  rootReducer
);

// 3. 创建 Store
const store = configureStore({
  // @ts-ignore store type is unknown
  reducer: persistedReducer as typeof rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        // 忽略 redux-persist 的特定 Action 类型检查，避免序列化警告
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    });
  },
  devTools: true, // 开启 Redux DevTools
});

// 导出类型定义
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// 4. 创建持久化存储器
export const persistor = persistStore(store, undefined, () => {
  // 持久化恢复完成后的回调
  // const state = store.getState();
  // console.log('State rehydrated:', state);
});

// 5. 导出自定义 Hooks (带类型)
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<typeof store>();

// 挂载到 window 对象以便调试
// @ts-ignore
window.store = store;

// 手动触发保存数据的工具方法
export const handleSaveData = async (): Promise<void> => {
  try {
    await persistor.flush();
  } catch (error) {
    console.error("Failed to save data:", error);
    throw error;
  }
};

export default store;
