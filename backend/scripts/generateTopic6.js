import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const topic6Enriched = [
  {
    slug: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "easy",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "List reversed from end to start." },
      { input: "head = [1,2]", output: "[2,1]", explanation: "Pair reversed." },
      { input: "head = [10]", output: "[10]", explanation: "Single node list reversed is identical." }
    ],
    constraints: ["The number of nodes in the list is the range [0, 5000].", "-5000 <= Node.val <= 5000"],
    topics: ["Linked List", "Recursion"],
    companies: ["Amazon", "Microsoft", "Apple", "Google"],
    hints: {
      h1: "Use three pointers: prev, curr, and next.",
      h2: "Store curr.next, point curr.next to prev, then advance prev = curr and curr = next.",
      h3: "Return prev as the new head."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 3 4 5", output: "5 4 3 2 1", hidden: false },
      { input: "1 2", output: "2 1", hidden: false },
      { input: "10", output: "10", hidden: false },
      // 10 Private Test Cases
      { input: "", output: "", hidden: true },
      { input: "1", output: "1", hidden: true },
      { input: "1 2 3", output: "3 2 1", hidden: true },
      { input: "1 1 1", output: "1 1 1", hidden: true },
      { input: "9 8 7 6", output: "6 7 8 9", hidden: true },
      { input: "-1 -2 -3", output: "-3 -2 -1", hidden: true },
      { input: "1 3 5 7 9", output: "9 7 5 3 1", hidden: true },
      { input: "0 0 1", output: "1 0 0", hidden: true },
      { input: "10 20 30 40 50", output: "50 40 30 20 10", hidden: true },
      { input: "100 200", output: "200 100", hidden: true }
    ]
  },
  {
    slug: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "easy",
    description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]", explanation: "Merged sorted order." },
      { input: "list1 = [], list2 = []", output: "[]", explanation: "Both empty lists." },
      { input: "list1 = [], list2 = [0]", output: "[0]", explanation: "One list is empty, return the other." }
    ],
    constraints: ["The number of nodes in both lists is in the range [0, 50].", "-100 <= Node.val <= 100", "Both list1 and list2 are sorted in non-decreasing order."],
    topics: ["Linked List", "Recursion"],
    companies: ["Amazon", "Apple", "Microsoft"],
    hints: {
      h1: "Use a dummy head node to simplify list building.",
      h2: "Compare list1.val and list2.val and append the smaller node to current.next.",
      h3: "Attach whichever list has remaining nodes."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 4 | 1 3 4", output: "1 1 2 3 4 4", hidden: false },
      { input: " | ", output: "", hidden: false },
      { input: " | 0", output: "0", hidden: false },
      // 10 Private Test Cases
      { input: "1 | 2", output: "1 2", hidden: true },
      { input: "2 | 1", output: "1 2", hidden: true },
      { input: "1 3 5 | 2 4 6", output: "1 2 3 4 5 6", hidden: true },
      { input: "5 | 1 2 3 4", output: "1 2 3 4 5", hidden: true },
      { input: "1 2 3 | 4 5 6", output: "1 2 3 4 5 6", hidden: true },
      { input: "-10 -5 0 | -8 -3 2", output: "-10 -8 -5 -3 0 2", hidden: true },
      { input: "1 1 1 | 2 2 2", output: "1 1 1 2 2 2", hidden: true },
      { input: "2 5 8 | 1 3 7 9 10", output: "1 2 3 5 7 8 9 10", hidden: true },
      { input: "7 | ", output: "7", hidden: true },
      { input: "0 2 4 6 | 1 3 5 7", output: "0 1 2 3 4 5 6 7", hidden: true }
    ]
  },
  {
    slug: "linked-list-cycle",
    title: "Linked List Cycle",
    difficulty: "easy",
    description: "Given head, the head of a linked list, determine if the linked list has a cycle in it. Return true if there is some node in the list that can be reached again by continuously following the next pointer. Otherwise, return false.",
    examples: [
      { input: "head = [3,2,0,-4], pos = 1", output: "true", explanation: "Cycle connects back to node index 1." },
      { input: "head = [1,2], pos = 0", output: "true", explanation: "Cycle connects back to index 0." },
      { input: "head = [1], pos = -1", output: "false", explanation: "No cycle in list." }
    ],
    constraints: ["The number of the nodes in the list is in the range [0, 10^4].", "-10^5 <= Node.val <= 10^5"],
    topics: ["Linked List", "Two Pointers"],
    companies: ["Microsoft", "Spotify", "Amazon"],
    hints: {
      h1: "Floyd's Tortoise and Hare algorithm.",
      h2: "Slow pointer moves 1 step, fast pointer moves 2 steps.",
      h3: "If slow meets fast, there is a cycle."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "3 2 0 -4\n1", output: "true", hidden: false },
      { input: "1 2\n0", output: "true", hidden: false },
      { input: "1\n-1", output: "false", hidden: false },
      // 10 Private Test Cases
      { input: "1 2 3 4 5\n-1", output: "false", hidden: true },
      { input: "1 2 3 4 5\n2", output: "true", hidden: true },
      { input: "1 2 3 4 5\n0", output: "true", hidden: true },
      { input: "1 2 3 4 5\n4", output: "true", hidden: true },
      { input: "10 20\n-1", output: "false", hidden: true },
      { input: "5\n0", output: "true", hidden: true },
      { input: "1 1\n1", output: "true", hidden: true },
      { input: "1 2 3\n-1", output: "false", hidden: true },
      { input: "1 2 3 4\n1", output: "true", hidden: true },
      { input: "9 8 7 6 5 4\n-1", output: "false", hidden: true }
    ]
  },
  {
    slug: "reorder-list",
    title: "Reorder List",
    difficulty: "medium",
    description: "You are given the head of a singly linked-list. Reorder the list to be on the following form: L0 -> Ln -> L1 -> Ln - 1 -> L2 -> Ln - 2 -> ... You may not modify the values in the list's nodes. Only nodes themselves may be changed.",
    examples: [
      { input: "head = [1,2,3,4]", output: "[1,4,2,3]", explanation: "Interleaved from ends." },
      { input: "head = [1,2,3,4,5]", output: "[1,5,2,4,3]", explanation: "Interleaved from ends." },
      { input: "head = [1]", output: "[1]", explanation: "Single node list remains identical." }
    ],
    constraints: ["The number of nodes in the list is in the range [1, 5 * 10^4].", "1 <= Node.val <= 1000"],
    topics: ["Linked List", "Two Pointers", "Stack"],
    companies: ["Amazon", "Facebook"],
    hints: {
      h1: "Step 1: Find the middle of the linked list using slow/fast pointers.",
      h2: "Step 2: Reverse the second half of the linked list.",
      h3: "Step 3: Merge the two halves alternately."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 3 4", output: "1 4 2 3", hidden: false },
      { input: "1 2 3 4 5", output: "1 5 2 4 3", hidden: false },
      { input: "1", output: "1", hidden: false },
      // 10 Private Test Cases
      { input: "1 2", output: "1 2", hidden: true },
      { input: "1 2 3", output: "1 3 2", hidden: true },
      { input: "1 2 3 4 5 6", output: "1 6 2 5 3 4", hidden: true },
      { input: "10 20 30 40", output: "10 40 20 30", hidden: true },
      { input: "2 4 6 8 10", output: "2 10 4 8 6", hidden: true },
      { input: "1 2 3 4 5 6 7", output: "1 7 2 6 3 5 4", hidden: true },
      { input: "5 4 3 2 1", output: "5 1 4 2 3", hidden: true },
      { input: "1 1 1 1", output: "1 1 1 1", hidden: true },
      { input: "9 8 7 6 5 4 3 2", output: "9 2 8 3 7 4 6 5", hidden: true },
      { input: "10 11", output: "10 11", hidden: true }
    ]
  },
  {
    slug: "remove-nth-node-from-end-of-list",
    title: "Remove Nth Node From End of List",
    difficulty: "medium",
    description: "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
    examples: [
      { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]", explanation: "Removed 4." },
      { input: "head = [1], n = 1", output: "[]", explanation: "Empty list returned." },
      { input: "head = [1,2], n = 1", output: "[1]", explanation: "Removed last node 2." }
    ],
    constraints: ["The number of nodes in the list is sz.", "1 <= sz <= 30", "0 <= Node.val <= 100", "1 <= n <= sz"],
    topics: ["Linked List", "Two Pointers"],
    companies: ["Apple", "Amazon", "Facebook"],
    hints: {
      h1: "Use two pointers fast and slow with a dummy node before head.",
      h2: "Advance fast n steps ahead first.",
      h3: "Move both pointers together until fast reaches the end; then slow.next = slow.next.next."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 3 4 5\n2", output: "1 2 3 5", hidden: false },
      { input: "1\n1", output: "", hidden: false },
      { input: "1 2\n1", output: "1", hidden: false },
      // 10 Private Test Cases
      { input: "1 2\n2", output: "2", hidden: true },
      { input: "1 2 3\n1", output: "1 2", hidden: true },
      { input: "1 2 3\n2", output: "1 3", hidden: true },
      { input: "1 2 3\n3", output: "2 3", hidden: true },
      { input: "1 2 3 4 5\n5", output: "2 3 4 5", hidden: true },
      { input: "1 2 3 4 5\n1", output: "1 2 3 4", hidden: true },
      { input: "10 20 30 40\n3", output: "10 30 40", hidden: true },
      { input: "5 6 7 8 9 10\n4", output: "5 6 8 9 10", hidden: true },
      { input: "100 200\n1", output: "100", hidden: true },
      { input: "100 200\n2", output: "200", hidden: true }
    ]
  },
  {
    slug: "add-two-numbers",
    title: "Add Two Numbers",
    difficulty: "medium",
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
    examples: [
      { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]", explanation: "342 + 465 = 807." },
      { input: "l1 = [0], l2 = [0]", output: "[0]", explanation: "0 + 0 = 0." },
      { input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]", output: "[8,9,9,9,0,0,0,1]", explanation: "Adding with repeated carries." }
    ],
    constraints: ["The number of nodes in each linked list is in the range [1, 100].", "0 <= Node.val <= 9"],
    topics: ["Linked List", "Math", "Recursion"],
    companies: ["Amazon", "Microsoft", "Google"],
    hints: {
      h1: "Keep a carry variable initialized to 0.",
      h2: "Sum corresponding nodes plus carry: sum = val1 + val2 + carry.",
      h3: "New node value is sum % 10 and new carry is sum / 10."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "2 4 3 | 5 6 4", output: "7 0 8", hidden: false },
      { input: "0 | 0", output: "0", hidden: false },
      { input: "9 9 9 9 9 9 9 | 9 9 9 9", output: "8 9 9 9 0 0 0 1", hidden: false },
      // 10 Private Test Cases
      { input: "1 | 1", output: "2", hidden: true },
      { input: "5 | 5", output: "0 1", hidden: true },
      { input: "1 8 | 0", output: "1 8", hidden: true },
      { input: "9 9 | 1", output: "0 0 1", hidden: true },
      { input: "1 2 3 | 4 5 6", output: "5 7 9", hidden: true },
      { input: "8 3 2 | 9 2 1", output: "7 6 3", hidden: true },
      { input: "5 6 | 5 4", output: "0 1 1", hidden: true },
      { input: "1 | 9 9 9", output: "0 0 0 1", hidden: true },
      { input: "3 7 | 9 2", output: "2 0 1", hidden: true },
      { input: "2 4 9 | 5 6 4 9", output: "7 0 4 0 1", hidden: true }
    ]
  },
  {
    slug: "merge-k-sorted-lists",
    title: "Merge k Sorted Lists",
    difficulty: "hard",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]", explanation: "Merged all sorted lists." },
      { input: "lists = []", output: "[]", explanation: "Empty array of lists." },
      { input: "lists = [[]]", output: "[]", explanation: "One empty list." }
    ],
    constraints: ["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500", "-10^4 <= lists[i][j] <= 10^4"],
    topics: ["Linked List", "Divide and Conquer", "Heap (Priority Queue)", "Merge Sort"],
    companies: ["Facebook", "Amazon", "Google", "Uber"],
    hints: {
      h1: "Use a min-heap (priority queue) storing the head node of each list.",
      h2: "Pop smallest node, attach to result list, and push node.next if non-null.",
      h3: "Overall time complexity is O(N log K) where N is total nodes."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 4 5 | 1 3 4 | 2 6", output: "1 1 2 3 4 4 5 6", hidden: false },
      { input: "", output: "", hidden: false },
      { input: " | ", output: "", hidden: false },
      // 10 Private Test Cases
      { input: "1 | 2 | 3", output: "1 2 3", hidden: true },
      { input: "3 | 2 | 1", output: "1 2 3", hidden: true },
      { input: "1 2 | 3 4 | 5 6", output: "1 2 3 4 5 6", hidden: true },
      { input: "1 10 | 2 9 | 3 8", output: "1 2 3 8 9 10", hidden: true },
      { input: "-2 -1 | -3 0 | 1 2", output: "-3 -2 -1 0 1 2", hidden: true },
      { input: "1 3 5 7 | 2 4 6 8", output: "1 2 3 4 5 6 7 8", hidden: true },
      { input: "5 | 4 | 3 | 2 | 1", output: "1 2 3 4 5", hidden: true },
      { input: "10 20 30 | 5 15 25 | 1 2 3", output: "1 2 3 5 10 15 20 25 30", hidden: true },
      { input: "1 | | 2", output: "1 2", hidden: true },
      { input: "0 0 | 0 0", output: "0 0 0 0", hidden: true }
    ]
  },
  {
    slug: "reverse-nodes-in-k-group",
    title: "Reverse Nodes in k-Group",
    difficulty: "hard",
    description: "Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list. k is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of k then left-out nodes, in the end, should remain as it is.",
    examples: [
      { input: "head = [1,2,3,4,5], k = 2", output: "[2,1,4,3,5]", explanation: "Nodes reversed in pairs." },
      { input: "head = [1,2,3,4,5], k = 3", output: "[3,2,1,4,5]", explanation: "First 3 reversed, remaining 2 untouched." },
      { input: "head = [1,2,3,4,5,6], k = 3", output: "[3,2,1,6,5,4]", explanation: "Two groups of 3 reversed." }
    ],
    constraints: ["The number of nodes in the list is n.", "1 <= k <= n <= 5000", "0 <= Node.val <= 1000"],
    topics: ["Linked List", "Recursion"],
    companies: ["Microsoft", "Amazon", "ByteDance"],
    hints: {
      h1: "Count k nodes ahead before attempting reversal. If fewer than k nodes remain, leave them untouched.",
      h2: "Reverse k nodes iteratively.",
      h3: "Recursively or iteratively connect the reversed group to the next group."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 3 4 5\n2", output: "2 1 4 3 5", hidden: false },
      { input: "1 2 3 4 5\n3", output: "3 2 1 4 5", hidden: false },
      { input: "1 2 3 4 5 6\n3", output: "3 2 1 6 5 4", hidden: false },
      // 10 Private Test Cases
      { input: "1 2 3 4 5\n1", output: "1 2 3 4 5", hidden: true },
      { input: "1 2 3 4 5\n5", output: "5 4 3 2 1", hidden: true },
      { input: "1 2 3 4\n2", output: "2 1 4 3", hidden: true },
      { input: "1 2 3 4\n4", output: "4 3 2 1", hidden: true },
      { input: "1\n1", output: "1", hidden: true },
      { input: "1 2\n2", output: "2 1", hidden: true },
      { input: "1 2 3 4 5 6 7 8\n4", output: "4 3 2 1 8 7 6 5", hidden: true },
      { input: "1 2 3 4 5 6 7 8\n3", output: "3 2 1 6 5 4 7 8", hidden: true },
      { input: "10 20 30 40 50 60\n2", output: "20 10 40 30 60 50", hidden: true },
      { input: "1 2 3 4 5 6 7\n2", output: "2 1 4 3 6 5 7", hidden: true }
    ]
  },
  {
    slug: "copy-list-with-random-pointer",
    title: "Copy List with Random Pointer",
    difficulty: "hard",
    description: "A linked list of length n is given such that each node contains an additional random pointer, which could point to any node in the list, or null. Construct a deep copy of the list.",
    examples: [
      { input: "head = [[7,null],[13,0],[11,4],[10,2],[1,0]]", output: "[[7,null],[13,0],[11,4],[10,2],[1,0]]", explanation: "Deep copy with identical pointers." },
      { input: "head = [[1,1],[2,1]]", output: "[[1,1],[2,1]]", explanation: "Random pointer points to index 1 for both nodes." },
      { input: "head = []", output: "[]", explanation: "Empty list returns null." }
    ],
    constraints: ["0 <= n <= 1000", "-10^4 <= Node.val <= 10^4"],
    topics: ["Linked List", "Hash Table"],
    companies: ["Amazon", "Microsoft", "Facebook"],
    hints: {
      h1: "Approach 1: Use a HashMap mapping original nodes to cloned nodes in O(N) space.",
      h2: "Approach 2: Interweave cloned nodes directly next to original nodes: A -> A' -> B -> B'.",
      h3: "Set random pointers via curr.next.random = curr.random.next, then decouple the lists in O(1) extra space."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "7 null | 13 0 | 11 4 | 10 2 | 1 0", output: "7 null | 13 0 | 11 4 | 10 2 | 1 0", hidden: false },
      { input: "1 1 | 2 1", output: "1 1 | 2 1", hidden: false },
      { input: "", output: "", hidden: false },
      // 10 Private Test Cases
      { input: "1 null", output: "1 null", hidden: true },
      { input: "1 0", output: "1 0", hidden: true },
      { input: "3 null | 3 0 | 3 null", output: "3 null | 3 0 | 3 null", hidden: true },
      { input: "1 null | 2 0", output: "1 null | 2 0", hidden: true },
      { input: "1 1 | 2 0", output: "1 1 | 2 0", hidden: true },
      { input: "5 null | 4 0 | 3 1", output: "5 null | 4 0 | 3 1", hidden: true },
      { input: "10 1 | 20 null", output: "10 1 | 20 null", hidden: true },
      { input: "1 2 | 2 0 | 3 1", output: "1 2 | 2 0 | 3 1", hidden: true },
      { input: "8 0 | 9 1", output: "8 0 | 9 1", hidden: true },
      { input: "2 null | 4 null | 6 null", output: "2 null | 4 null | 6 null", hidden: true }
    ]
  },
  {
    slug: "lru-cache",
    title: "LRU Cache",
    difficulty: "hard",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get(key) and put(key, value) in O(1) average time complexity.",
    examples: [
      { input: "cap 2: put 1 1, put 2 2, get 1, put 3 3, get 2, put 4 4, get 1, get 3, get 4", output: "1 -1 -1 3 4", explanation: "Key 2 evicted when 3 is added." },
      { input: "cap 1: put 2 1, get 2", output: "1", explanation: "Capacity 1 cache returns 1." },
      { input: "cap 2: get 2, put 2 6, get 1, put 1 5, put 1 2, get 1, get 2", output: "-1 -1 2 6", explanation: "Handling overwrite and missed queries." }
    ],
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5", "At most 2 * 10^5 calls to get and put."],
    topics: ["Linked List", "Hash Table", "Design", "Doubly-Linked List"],
    companies: ["Amazon", "Google", "Bloomberg", "Microsoft"],
    hints: {
      h1: "Combine a Doubly Linked List with a Hash Map.",
      h2: "The Doubly Linked List maintains access order with O(1) node additions and removals.",
      h3: "The Hash Map maps keys directly to Doubly Linked List node references for O(1) retrieval."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "cap 2: put 1 1, put 2 2, get 1, put 3 3, get 2, put 4 4, get 1, get 3, get 4", output: "1 -1 -1 3 4", hidden: false },
      { input: "cap 1: put 2 1, get 2", output: "1", hidden: false },
      { input: "cap 2: get 2, put 2 6, get 1, put 1 5, put 1 2, get 1, get 2", output: "-1 -1 2 6", hidden: false },
      // 10 Private Test Cases
      { input: "cap 1: put 1 10, put 2 20, get 1, get 2", output: "-1 20", hidden: true },
      { input: "cap 2: put 1 1, get 1", output: "1", hidden: true },
      { input: "cap 2: get 1", output: "-1", hidden: true },
      { input: "cap 3: put 1 1, put 2 2, put 3 3, get 1, put 4 4, get 2", output: "1 -1", hidden: true },
      { input: "cap 2: put 1 1, put 2 2, put 1 10, get 1, get 2", output: "10 2", hidden: true },
      { input: "cap 1: put 1 1, get 1, put 1 2, get 1", output: "1 2", hidden: true },
      { input: "cap 2: put 2 1, put 1 1, put 2 3, put 4 1, get 1, get 2", output: "-1 3", hidden: true },
      { input: "cap 3: put 1 10, put 2 20, put 3 30, get 2, put 4 40, get 1, get 2", output: "20 -1 20", hidden: true },
      { input: "cap 2: put 1 1, put 2 2, get 2, put 3 3, get 1", output: "2 -1", hidden: true },
      { input: "cap 4: put 1 1, put 2 2, put 3 3, put 4 4, get 1, get 2, get 3, get 4", output: "1 2 3 4", hidden: true }
    ]
  }
];

const content = `// TOPIC 6: LINKED LISTS (10 Problems - Fully Enriched with 3 Public & 10 Private Test Cases)\nexport const topic6 = ${JSON.stringify(topic6Enriched, null, 2)};\n`;
fs.writeFileSync(path.resolve(__dirname, '../data/topic6_linked_lists.js'), content, 'utf8');
console.log('Successfully wrote enriched topic6_linked_lists.js!');
