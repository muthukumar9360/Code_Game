// Solvers for Topic 2: Two Pointers
export const topic2Solvers = {
  "valid-palindrome": (input) => {
    const clean = input.toLowerCase().replace(/[^a-z0-9]/g, "");
    const rev = clean.split("").reverse().join("");
    return clean === rev ? "true" : "false";
  },

  "move-zeroes": (input) => {
    const nums = input.trim().split(/\s+/).map(Number);
    let insertPos = 0;
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] !== 0) {
        nums[insertPos++] = nums[i];
      }
    }
    while (insertPos < nums.length) {
      nums[insertPos++] = 0;
    }
    return nums.join(" ");
  },

  "remove-duplicates-from-sorted-array": (input) => {
    if (!input.trim()) return "0";
    const nums = input.trim().split(/\s+/).map(Number);
    if (nums.length === 0) return "0";
    let k = 1;
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] !== nums[i - 1]) {
        nums[k++] = nums[i];
      }
    }
    return String(k);
  },

  "two-sum-ii-input-array-is-sorted": (input) => {
    const [line1, line2] = input.trim().split("\n");
    const nums = line1.trim().split(/\s+/).map(Number);
    const target = Number(line2.trim());
    let left = 0, right = nums.length - 1;
    while (left < right) {
      const sum = nums[left] + nums[right];
      if (sum === target) return `${left + 1} ${right + 1}`;
      if (sum < target) left++;
      else right--;
    }
    return "";
  },

  "3sum": (input) => {
    const nums = input.trim().split(/\s+/).map(Number).sort((a, b) => a - b);
    const res = [];
    for (let i = 0; i < nums.length - 2; i++) {
      if (i > 0 && nums[i] === nums[i - 1]) continue;
      let left = i + 1, right = nums.length - 1;
      while (left < right) {
        const sum = nums[i] + nums[left] + nums[right];
        if (sum === 0) {
          res.push(`${nums[i]} ${nums[left]} ${nums[right]}`);
          while (left < right && nums[left] === nums[left + 1]) left++;
          while (left < right && nums[right] === nums[right - 1]) right--;
          left++;
          right--;
        } else if (sum < 0) left++;
        else right--;
      }
    }
    return res.join(" | ");
  },

  "container-with-most-water": (input) => {
    const height = input.trim().split(/\s+/).map(Number);
    let maxArea = 0, left = 0, right = height.length - 1;
    while (left < right) {
      const w = right - left;
      const h = Math.min(height[left], height[right]);
      maxArea = Math.max(maxArea, w * h);
      if (height[left] < height[right]) left++;
      else right--;
    }
    return String(maxArea);
  },

  "trapping-rain-water": (input) => {
    const height = input.trim().split(/\s+/).map(Number);
    let left = 0, right = height.length - 1;
    let leftMax = 0, rightMax = 0, total = 0;
    while (left < right) {
      if (height[left] < height[right]) {
        if (height[left] >= leftMax) leftMax = height[left];
        else total += leftMax - height[left];
        left++;
      } else {
        if (height[right] >= rightMax) rightMax = height[right];
        else total += rightMax - height[right];
        right--;
      }
    }
    return String(total);
  },

  "4sum": (input) => {
    const [line1, line2] = input.trim().split("\n");
    const nums = line1.trim().split(/\s+/).map(Number).sort((a, b) => a - b);
    const target = Number(line2.trim());
    const res = [];
    const n = nums.length;
    for (let i = 0; i < n - 3; i++) {
      if (i > 0 && nums[i] === nums[i - 1]) continue;
      for (let j = i + 1; j < n - 2; j++) {
        if (j > i + 1 && nums[j] === nums[j - 1]) continue;
        let left = j + 1, right = n - 1;
        while (left < right) {
          const sum = nums[i] + nums[j] + nums[left] + nums[right];
          if (sum === target) {
            res.push(`${nums[i]} ${nums[j]} ${nums[left]} ${nums[right]}`);
            while (left < right && nums[left] === nums[left + 1]) left++;
            while (left < right && nums[right] === nums[right - 1]) right--;
            left++;
            right--;
          } else if (sum < target) left++;
          else right--;
        }
      }
    }
    return res.join(" | ");
  },

  "minimum-window-substring": (input) => {
    const [s, t] = input.trim().split("\n");
    if (!s || !t) return "";
    const map = new Map();
    for (const c of t) map.set(c, (map.get(c) || 0) + 1);
    let required = map.size;
    let left = 0, right = 0, formed = 0;
    const windowCounts = new Map();
    let minLen = Infinity, minStart = 0;

    while (right < s.length) {
      const c = s[right];
      windowCounts.set(c, (windowCounts.get(c) || 0) + 1);
      if (map.has(c) && windowCounts.get(c) === map.get(c)) formed++;

      while (left <= right && formed === required) {
        if (right - left + 1 < minLen) {
          minLen = right - left + 1;
          minStart = left;
        }
        const lc = s[left];
        windowCounts.set(lc, windowCounts.get(lc) - 1);
        if (map.has(lc) && windowCounts.get(lc) < map.get(lc)) formed--;
        left++;
      }
      right++;
    }
    return minLen === Infinity ? "" : s.substring(minStart, minStart + minLen);
  },

  "smallest-range-covering-elements-from-k-lists": (input) => {
    const lists = input.trim().split("|").map(l => l.trim().split(/\s+/).map(Number));
    const elements = [];
    for (let i = 0; i < lists.length; i++) {
      for (const val of lists[i]) {
        elements.push({ val, listIdx: i });
      }
    }
    elements.sort((a, b) => a.val - b.val);

    const count = new Map();
    let covered = 0;
    let left = 0;
    let minRange = Infinity, bestStart = 0, bestEnd = 0;

    for (let right = 0; right < elements.length; right++) {
      const c = elements[right].listIdx;
      count.set(c, (count.get(c) || 0) + 1);
      if (count.get(c) === 1) covered++;

      while (covered === lists.length) {
        const curRange = elements[right].val - elements[left].val;
        if (curRange < minRange) {
          minRange = curRange;
          bestStart = elements[left].val;
          bestEnd = elements[right].val;
        }
        const lc = elements[left].listIdx;
        count.set(lc, count.get(lc) - 1);
        if (count.get(lc) === 0) covered--;
        left++;
      }
    }
    return `${bestStart} ${bestEnd}`;
  },

  "palindrome-number-verification": (input) => {
    const str = input.trim();
    if (str.startsWith("-")) return "false";
    const rev = str.split("").reverse().join("");
    return str === rev ? "true" : "false";
  }
};
