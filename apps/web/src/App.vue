<script setup lang="ts">
import { Button, KunkkaUpload, KunkkaBatchSelect } from "@kunkka/ui";
import { useKunkkaModal, KunkkaScrollbar } from "@kunkka/ui";
import { Layout } from "@effects/ui";
import type { MenuRecordRaw } from "@kunkka/ui";
import { ref } from 'vue';

const selectValue = ref([]);
const selectOptions = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
  { value: '4', label: 'Option 4' },
  { value: '5', label: 'Option 5' },
];

const [SlideModal, { open, close }] = useKunkkaModal({
  title: "Kunkka Modal Demo",
  draggable: true,
  animationType: "slide",
  showOkBtn: true,
  showCancelBtn: true,
  onOk: () => {
    console.log("OK Clicked from options!");
    close();
  },
  onCancel: () => {
    console.log("Cancel Clicked from options!");
    // close();
  },
});

const handleOpen = () => {
  open();
};

const handleMyBusinessLogic = () => {
  alert(1);
};

const menus: MenuRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: 'lucide:layout-dashboard',
    children: [
      {
        path: '/dashboard/analytics',
        name: 'Analytics',
        icon: 'lucide:bar-chart',
      },
      {
        path: '/dashboard/ecommerce',
        name: 'E-commerce',
        icon: 'lucide:shopping-bag',
      }
    ]
  },
  {
    path: '/users',
    name: 'Users',
    icon: 'lucide:users',
    children: [
        {
            path: '/users/list',
            name: 'User List',
        },
        {
            path: '/users/roles',
            name: 'Roles',
        }
    ]
  },
  {
    path: '/settings',
    name: 'Settings',
    icon: 'lucide:settings',
  }
];

const collapsed = ref(false);
</script>

<template>
  <Layout :menus="menus">
    <div
      class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 gap-8"
    >
      <div class="w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Vue 3 + Monorepo + Kunkka UI
        </h1>
        <p class="text-gray-600 mb-8">
          This demo shows the usage of the Modal component with the composable
          pattern.
        </p>

        <div class="space-x-4">
          <Button label="Open Modal" primary @click="handleOpen" />
        </div>

        <div class="mt-8 text-left">
          <h2 class="text-xl font-bold mb-4">Select Demo (Excel Copy Paste)</h2>
          <p class="mb-2 text-sm text-gray-500">
            1. Try copying a column from Excel or text editor with values like "Option 1", "Option 2" (separated by newlines).
            <br/>
            2. Paste into the search input of the select.
          </p>
          <KunkkaBatchSelect
            v-model="selectValue"
            :options="selectOptions"
            placeholder="Paste Excel content here..."
            style="width: 320px"
          />
          <div class="mt-2 text-sm">
            Selected: {{ selectValue }}
          </div>
        </div>

        <div class="mt-8 text-left">
          <h2 class="text-xl font-bold mb-4">Scrollbar Demo</h2>
          <div class="h-[200px] w-[350px] rounded-md border p-4">
            <KunkkaScrollbar shadow class="h-full">
              <div class="space-y-4 p-4">
                <div v-for="i in 20" :key="i" class="text-sm">
                  Content line {{ i }}
                </div>
              </div>
            </KunkkaScrollbar>
          </div>
        </div>

        <div class="mt-8 text-left w-full">
          <h2 class="text-xl font-bold mb-4">Upload Demo</h2>
          <div class="bg-white p-4 rounded-lg shadow border">
            <KunkkaUpload />
          </div>
        </div>
      </div>
      
      <!-- The Modal Component -->
      <SlideModal @close="handleMyBusinessLogic">
        <div class="p-4">
          <p>This is the content of the modal.</p>
          <p>It was created using the useKunkkaModal composable.</p>
          <p>
            It uses the default footer configuration defined in the composable
            options.
          </p>
        </div>
      </SlideModal>
    </div>
  </Layout>
</template>
