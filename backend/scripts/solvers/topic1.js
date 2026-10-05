// Solvers for Topic 1: Arrays & Hashing
export const topic1Solvers = {
  "two-sum": (input) => {
    const lines = input.trim().split("\n");
    const nums = lines[0].trim().split(/\s+/).map(Number);
    const target = Number(lines[1].trim());
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
      const comp = target - nums[i];
      if (map.has(comp)) {
        return `${map.get(comp)} ${i}`;
      }
      map.set(nums[i], i);
    }
    return "";
  },

  "contains-duplicate": (input) => {
    if (!input.trim()) return "false";
    const nums = input.trim().split(/\s+/).map(Number);
    return new Set(nums).size !== nums.length ? "true" : "false";
  },

  "valid-anagram": (input) => {
    const [s, t] = input.trim().split("\n").map(x => x.trim());
    if (s.length !== t.length) return "false";
    const count = {};
    for (const c of s) count[c] = (count[c] || 0) + 1;
    for (const c of t) {
      if (!count[c]) return "false";
      count[c]--;
    }
    return "true";
  },

  "group-anagrams": (input) => {
    if (!input.trim()) return "";
    const words = input.trim().split(/\s+/);
    const map = new Map();
    for (const w of words) {
      const key = w.split("").sort().join("");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(w);
    }
    const groups = Array.from(map.values()).map(g => g.join(" "));
    return groups.join(" | ");
  },

  "top-k-frequent-elements": (input) => {
    const [line1, line2] = input.trim().split("\n");
    const nums = line1.trim().split(/\s+/).map(Number);
    const k = Number(line2.trim());
    const count = new Map();
    for (const n of nums) count.set(n, (count.get(n) || 0) + 1);
    const sorted = Array.from(count.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, k).map(x => x[0]).join(" ");
  },

  "product-of-array-except-self": (input) => {
    const nums = input.trim().split(/\s+/).map(Number);
    const n = nums.length;
    const res = new Array(n).fill(1);
    let left = 1;
    for (let i = 0; i < n; i++) {
      res[i] = left;
      left *= nums[i];
    }
    let right = 1;
    for (let i = n - 1; i >= 0; i--) {
      res[i] *= right;
      right *= nums[i];
    }
    return res.join(" ");
  },

  "first-missing-positive": (input) => {
    const nums = input.trim().split(/\s+/).map(Number);
    const n = nums.length;
    for (let i = 0; i < n; i++) {
      while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
        const temp = nums[nums[i] - 1];
        nums[nums[i] - 1] = nums[i];
        nums[i] = temp;
      }
    }
    for (let i = 0; i < n; i++) {
      if (nums[i] !== i + 1) return String(i + 1);
    }
    return String(n + 1);
  },

  "longest-consecutive-sequence": (input) => {
    if (!input.trim()) return "0";
    const nums = input.trim().split(/\s+/).map(Number);
    const set = new Set(nums);
    let maxLen = 0;
    for (const num of set) {
      if (!set.has(num - 1)) {
        let curr = num;
        let len = 1;
        while (set.has(curr + 1)) {
          curr++;
          len++;
        }
        maxLen = Math.max(maxLen, len);
      }
    }
    return String(maxLen);
  },

  "maximum-gap": (input) => {
    const nums = input.trim().split(/\s+/).map(Number);
    if (nums.length < 2) return "0";
    nums.sort((a, b) => a - b);
    let maxDiff = 0;
    for (let i = 1; i < nums.length; i++) {
      maxDiff = Math.max(maxDiff, nums[i] - nums[i - 1]);
    }
    return String(maxDiff);
  },

  "subarrays-with-k-different-integers": (input) => {
    const [line1, line2] = input.trim().split("\n");
    const nums = line1.trim().split(/\s+/).map(Number);
    const k = Number(line2.trim());

    const atMost = (arr, distinctK) => {
      let count = 0, left = 0;
      const freq = new Map();
      for (let right = 0; right < arr.length; right++) {
        freq.set(arr[right], (freq.get(arr[right]) || 0) + 1);
        while (freq.size > distinctK) {
          const c = freq.get(arr[left]) - 1;
          if (c === 0) freq.delete(arr[left]);
          else freq.set(arr[left], c);
          left++;
        }
        count += (right - left + 1);
      }
      return count;
    };

    return String(atMost(nums, k) - atMost(nums, k - 1));
  }
};
