
import { ref, reactive, computed, Ref } from 'vue';
import { useVueFlow } from '@vue-flow/core';
import type { Node as FlowNode, Edge as FlowEdge } from '@vue-flow/core';

import NodeSimpleStep from '../Nodes/NodeSimple/NodeSimpleStep.vue';
import NodeBranch from '../Nodes/NodeBranch/NodeBranch.vue';
import NodeBranchChild from '../Nodes/NodeBranch/NodeBranchChild.vue';
import NodeGoto from '../Nodes/NodeGoto/NodeGoto.vue';
import AddNode from '../Nodes/AddNode/AddNode.vue';

interface GoToMode {
  active: boolean;
  sourceNodeId: string | null;
  sourceY: number | null;
}

export function useFlowBoard() {

  const centerX = 550;
  const { updateNodeInternals }: any = useVueFlow();
  const lastEndPosition = ref<{ x: number; y: number } | null>(null);

  // Nodos y aristas
  const nodes = ref<FlowNode[]>([
    { id: 'start', type: 'start', position: { x: centerX, y: 100 }, data: { label: 'Inicio' } },
    { id: 'add-0', type: 'add', position: { x: centerX + 58, y: 180 }, data: {} },
    { id: 'end', type: 'end', position: { x: centerX, y: 260 }, data: { label: 'Fin' } },
  ]);
  const edges = ref<FlowEdge[]>([]);




 
  const nodeTypes = {
    add: AddNode,
    'simple-step': NodeSimpleStep,
    branch: NodeBranch,
    'branch-child': NodeBranchChild,
    goto: NodeGoto,
  };

 
  const gotoMode = reactive<GoToMode>({
    active: false,
    sourceNodeId: null,
    sourceY: null,
  });

 
  const availableTargetNodes = computed<FlowNode[]>(() => {
    if (!gotoMode.active) return [];
    return nodes.value.filter(
      node => ['simple-step', 'branch'].includes(node.type) && node.position.y < (gotoMode.sourceY ?? 0)
    );
  });

 
  function rebuildEdges(): void {
    edges.value = [];
    nodes.value.forEach((node) => {
      if (node.type === 'add') {
        const gotoChild = nodes.value.find(
          n => n.type === 'goto' && n.position.x === node.position.x && Math.abs(n.position.y - node.position.y - 60) < 10
        );
        if (gotoChild) {
          edges.value.push({
            id: `e-${node.id}-${gotoChild.id}`,
            source: node.id,
            target: gotoChild.id,
            type: 'straight',
            sourceHandle: 'bottom',
            targetHandle: 'top',
          });
        }
        return;
      }
      if (node.type === 'branch') {
       
        const leftNode = nodes.value.find(
          n => Math.abs(n.position.y - node.position.y - 100) < 10 && Math.abs(n.position.x - (node.position.x - 150)) < 10
        );
        const rightNode = nodes.value.find(
          n => Math.abs(n.position.y - node.position.y - 100) < 10 && Math.abs(n.position.x - (node.position.x + 150)) < 10
        );
        if (leftNode) {
          edges.value.push({ id: `e-${node.id}-${leftNode.id}`, source: node.id, target: leftNode.id, type: 'smoothstep', sourceHandle: 'left', targetHandle: 'top' });
          const leftAdd = nodes.value.find(
            n => n.type === 'add' && Math.abs(n.position.y - leftNode.position.y - 80) < 10 && Math.abs(n.position.x - leftNode.position.x) < 10
          );
          if (leftAdd) {
            edges.value.push({ id: `e-${leftNode.id}-${leftAdd.id}`, source: leftNode.id, target: leftAdd.id, type: 'straight', sourceHandle: 'bottom', targetHandle: 'top' });
            const leftEnd = nodes.value.find(
              n => n.type === 'end' && Math.abs(n.position.y - leftAdd.position.y - 80) < 10 && n.position.x === leftNode.position.x
            );
            if (leftEnd) {
              edges.value.push({ id: `e-${leftAdd.id}-${leftEnd.id}`, source: leftAdd.id, target: leftEnd.id, type: 'straight', sourceHandle: 'bottom', targetHandle: 'top' });
            }
          }
        }
        if (rightNode) {
          edges.value.push({ id: `e-${node.id}-${rightNode.id}`, source: node.id, target: rightNode.id, type: 'smoothstep', sourceHandle: 'right', targetHandle: 'top' });
          const rightAdd = nodes.value.find(
            n => n.type === 'add' && Math.abs(n.position.y - rightNode.position.y - 80) < 10 && Math.abs(n.position.x - rightNode.position.x) < 10
          );
          if (rightAdd) {
            edges.value.push({ id: `e-${rightNode.id}-${rightAdd.id}`, source: rightNode.id, target: rightAdd.id, type: 'straight', sourceHandle: 'bottom', targetHandle: 'top' });
            const rightEnd = nodes.value.find(
              n => n.type === 'end' && Math.abs(n.position.y - rightAdd.position.y - 80) < 10 && n.position.x === rightNode.position.x
            );
            if (rightEnd) {
              edges.value.push({ id: `e-${rightAdd.id}-${rightEnd.id}`, source: rightAdd.id, target: rightEnd.id, type: 'straight', sourceHandle: 'bottom', targetHandle: 'top' });
            }
          }
        }
        return;
      }
      if (node.type !== 'end') {
        const nextNode = nodes.value.find(
          n => n.position.y > node.position.y && n.position.x === node.position.x
        );
        if (nextNode) {
          edges.value.push({ id: `e-${node.id}-${nextNode.id}`, source: node.id, target: nextNode.id, type: 'straight', sourceHandle: 'bottom', targetHandle: 'top' });
        }
      }
    });
  }


  const sidebarOpen = ref<boolean>(false);
  const editingNode = ref<FlowNode | null>(null);
  const editingLabel = ref<string>('');
  const branchLeftLabel = ref<string>('');
  const branchRightLabel = ref<string>('');

  function closeSidebar(): void {
    sidebarOpen.value = false;
    editingNode.value = null;
    editingLabel.value = '';
    branchLeftLabel.value = '';
    branchRightLabel.value = '';
  }

 
function onNodeClick({ node }: { node: FlowNode }) {
  // console.log(
  //   ' click en nodo:', node.id,
  //   '– type:', node.type,
  //   '– gotoMode.active:', gotoMode.active
  // );


  if (gotoMode.active && gotoMode.sourceNodeId) {
    // Detengo la pulsación en los nodos objetivo
    availableTargetNodes.value.forEach(targetNode => {
      targetNode.data.pulsing = false;
      updateNodeInternals(targetNode.id);
    });

    // Asigno el ícono correcto al nodo goto según el tipo del nodo clickeado
    const gotoNode = nodes.value.find(n => n.id === gotoMode.sourceNodeId);
    if (gotoNode) {
      gotoNode.data.icon = node.type === 'branch' ? 'device_hub' : 'description';
      updateNodeInternals(gotoNode.id);
    }

    // Dibujo la arista dashed goto→nodo clickeado
    edges.value.push({
      id: `e-${gotoMode.sourceNodeId}-${node.id}`,
      source: gotoMode.sourceNodeId,
      target: node.id,
      type: 'straight',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      style: {
        strokeWidth: 2,
        stroke: '#2196f3',
        strokeDasharray: '10 10',
        animation: 'flowDash 0.5s linear infinite',
      },
    });

 
    gotoMode.active = false;
    gotoMode.sourceNodeId = null;
    gotoMode.sourceY = null;
    return;
  }


  if (node.type === 'add') {
    editingNode.value = node;
    sidebarOpen.value = true;
    return;
  }

  
  if (node.type === 'simple-step' || node.type === 'branch-child') {
    editingNode.value  = node;
    editingLabel.value = node.data.label || '';
    sidebarOpen.value  = true;
    return;
  }

  if (node.type === 'branch') {
    editingNode.value  = node;
    editingLabel.value = node.data.label || '';

    const left = nodes.value.find(n =>
      n.type === 'branch-child' &&
      Math.abs(n.position.y - node.position.y - 100) < 10 &&
      Math.abs(n.position.x - (node.position.x - 150)) < 10
    );
    const right = nodes.value.find(n =>
      n.type === 'branch-child' &&
      Math.abs(n.position.y - node.position.y - 100) < 10 &&
      Math.abs(n.position.x - (node.position.x + 150)) < 10
    );

    branchLeftLabel.value  = left?.data.label  || '';
    branchRightLabel.value = right?.data.label || '';
    sidebarOpen.value      = true;
    return;
  }


}






function addSimpleNode() {
  console.log('🔥 useFlowBoard.addSimpleNode() disparada');
  if (!editingNode.value) return;

  const clickedY = editingNode.value.position.y;
  const parentX = editingNode.value.position.x - 73; 


  nodes.value
    .filter((n) => n.position.y > clickedY)
    .forEach((n) => (n.position.y += 120));


  const simpleId = `simple-${Date.now()}`;
  const newAddId = `add-${Date.now()}`;

  
  nodes.value.push(
    {
      id: simpleId,
      type: "simple-step",
      position: { x: parentX, y: clickedY + 60 },
      data: { label: "Paso simple" },
    },
    {
      id: newAddId,
      type: "add",
      position: { x: parentX + 73, y: clickedY + 120 },
    }
  );

  rebuildEdges();
  sidebarOpen.value = false;
}

 function addBranchNode() {
  if (!editingNode.value) return;

  const clickedY = editingNode.value.position.y;
  nodes.value = nodes.value.filter((n) => n.type !== "end");

  const hasBranch = nodes.value.some((n) => n.type === "branch");

  
  const parentX = !hasBranch ? centerX : editingNode.value.position.x - 60;

  
  const branchId = `branch-${Date.now()}`;
  const leftId = `simple-left-${Date.now()}`;
  const rightId = `simple-right-${Date.now()}`;
  const leftAddId = `add-left-${Date.now()}`;
  const rightAddId = `add-right-${Date.now()}`;
  const leftEndId = `end-left-${Date.now()}`;
  const rightEndId = `end-right-${Date.now()}`;

  const nodesAfter = nodes.value.filter((n) => n.position.y > clickedY);
  nodesAfter.forEach((n) => (n.position.y += 320));


  nodes.value.push(
    {
      id: branchId,
      type: "branch",
      position: { x: parentX, y: clickedY + 60 },
      data: { label: "Paso rama" },
    },
    {
      id: leftId,
      type: "branch-child",
      position: { x: parentX - 150, y: clickedY + 160 },
      data: { label: "Nombre de rama" },
    },
    {
      id: rightId,
      type: "branch-child",
      position: { x: parentX + 150, y: clickedY + 160 },
      data: { label: "Nombre de rama" },
    },
    {
      id: leftAddId,
      type: "add",
      position: { x: parentX - 92, y: clickedY + 240 },
    },
    {
      id: rightAddId,
      type: "add",
      position: { x: parentX + 208, y: clickedY + 240 },
    },
    {
      id: leftEndId,
      type: "end",
      position: { x: parentX - 150, y: clickedY + 320 },
      data: { label: "Fin" },
    },
    {
      id: rightEndId,
      type: "end",
      position: { x: parentX + 150, y: clickedY + 320 },
      data: { label: "Fin" },
    }
  );

  rebuildEdges();
  sidebarOpen.value = false;
}
 function addGotoNode() {
  if (!editingNode.value) return;

  const { x, y } = editingNode.value.position;
  const gotoId = `goto-${Date.now()}`;

 
  nodes.value.push({
    id: gotoId,
    type: "goto",
    position: { x, y: y + 60 },
    data: { icon: null },
  });


  gotoMode.active = true;
  gotoMode.sourceNodeId = gotoId;
  gotoMode.sourceY = y + 60;

  // Activar pulsación en nodos objetivo disponibles
  availableTargetNodes.value.forEach((node) => {
    node.data.pulsing = true;
    updateNodeInternals(node.id);
  });

  sidebarOpen.value = false;
}
  function saveEdit() {
    
  if (editingNode.value) {
    if (editingNode.value.type === "branch") {
      
      editingNode.value.data.label = editingLabel.value;
      updateNodeInternals(editingNode.value.id);

      // Actualizar etiquetas de los nodos hijos
      const leftNode = nodes.value.find(
        (n) =>
          Math.abs(n.position.y - editingNode.value.position.y - 100) < 10 &&
          Math.abs(n.position.x - (editingNode.value.position.x - 150)) < 10
      );
      const rightNode = nodes.value.find(
        (n) =>
          Math.abs(n.position.y - editingNode.value.position.y - 100) < 10 &&
          Math.abs(n.position.x - (editingNode.value.position.x + 150)) < 10
      );

      if (leftNode) {
        leftNode.data.label = branchLeftLabel.value;
        updateNodeInternals(leftNode.id);
      }
      if (rightNode) {
        rightNode.data.label = branchRightLabel.value;
        updateNodeInternals(rightNode.id);
      }
    } else {
      // Actualizar etiqueta de nodo simple
      editingNode.value.data.label = editingLabel.value;
      updateNodeInternals(editingNode.value.id);
    }
  }
  closeSidebar();
}
 
function deleteNode() {
  if (
    !editingNode.value ||
    editingNode.value.type === "start" ||
    editingNode.value.type === "end"
  )
    return;

  const currentY = editingNode.value.position.y;
  const nodesToDelete = [];

  if (editingNode.value.type === "branch") {
    // Encontrar nodos hijos de la rama
    const leftNode = nodes.value.find(
      (n) =>
        Math.abs(n.position.y - currentY - 100) < 10 &&
        Math.abs(n.position.x - (editingNode.value.position.x - 150)) < 10
    );
    const rightNode = nodes.value.find(
      (n) =>
        Math.abs(n.position.y - currentY - 100) < 10 &&
        Math.abs(n.position.x - (editingNode.value.position.x + 150)) < 10
    );

    
    if (leftNode) {
      nodesToDelete.push(leftNode.id);
      const leftAdd = nodes.value.find(
        (n) =>
          n.type === "add" &&
          Math.abs(n.position.y - leftNode.position.y - 80) < 10 &&
          Math.abs(n.position.x - (centerX - 92)) < 10
      );
      if (leftAdd) nodesToDelete.push(leftAdd.id);

      const leftEnd = nodes.value.find(
        (n) =>
          n.type === "end" &&
          Math.abs(n.position.y - leftNode.position.y - 160) < 10 &&
          Math.abs(n.position.x - (centerX - 150)) < 10
      );
      if (leftEnd) nodesToDelete.push(leftEnd.id);
    }

    if (rightNode) {
      nodesToDelete.push(rightNode.id);
      const rightAdd = nodes.value.find(
        (n) =>
          n.type === "add" &&
          Math.abs(n.position.y - rightNode.position.y - 80) < 10 &&
          Math.abs(n.position.x - (centerX + 208)) < 10
      );
      if (rightAdd) nodesToDelete.push(rightAdd.id);

      const rightEnd = nodes.value.find(
        (n) =>
          n.type === "end" &&
          Math.abs(n.position.y - rightNode.position.y - 160) < 10 &&
          Math.abs(n.position.x - (centerX + 150)) < 10
      );
      if (rightEnd) nodesToDelete.push(rightEnd.id);
    }
  }

  
  nodesToDelete.push(editingNode.value.id);

  // Eliminar todos los nodos marcados
  nodes.value = nodes.value.filter((n) => !nodesToDelete.includes(n.id));

  // Si es una rama, restaurar el nodo fin original en su posición anterior
  if (editingNode.value.type === "branch" && lastEndPosition.value) {
    // Ajustar la posición Y del nodo fin para que esté por debajo del último nodo
    const lastNode = nodes.value.reduce((max, node) => {
      return node.position.y > max.position.y ? node : max;
    }, nodes.value[0]);

    const newEndPosition = {
      x: centerX,
      y: lastNode.position.y + (lastNode.type === "add" ? 80 : 120),
    };

    nodes.value.push({
      id: "end",
      type: "end",
      position: newEndPosition,
      data: { label: "Fin" },
    });
    lastEndPosition.value = null;
  }

  // Ajustar posiciones de los nodos siguientes
  const nodesAfter = nodes.value.filter((n) => n.position.y > currentY);
  const yOffset = editingNode.value.type === "branch" ? 320 : 120;
  nodesAfter.forEach((node) => {
    node.position.y -= yOffset;
  });

  rebuildEdges();
  closeSidebar();
}

 
  rebuildEdges();

  return {
    nodes,
    edges,
    nodeTypes,
    sidebarOpen,
    editingNode,
    editingLabel,
    branchLeftLabel,
    branchRightLabel,
    gotoMode,
    availableTargetNodes,
    rebuildEdges,
    closeSidebar,
    onNodeClick,
    addSimpleNode,
    addBranchNode,
    addGotoNode,
    saveEdit,
    deleteNode,
  };
}
