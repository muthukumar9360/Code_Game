import React, { useState } from "react";
import axios from "axios";

const createprogram = () => {
  const [form, setForm] = useState({
    slug: "",
    title: "",
    difficulty: "easy",
    description: "",
    examples: [{ input: "", output: "", explanation: "" }],
    constraints: [""],
    topics: [""],
    companies: [""],
    hints: { h1: "", h2: "", h3: "" },
    testcases: [{ input: "", output: "", hidden: false }],
  });

  const API = import.meta.env.VITE_API_URL; // Your backend API

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Change nested fields
  const handleNestedChange = (section, index, field, value) => {
    const updated = [...form[section]];
    updated[index][field] = value;
    setForm({ ...form, [section]: updated });
  };

  // Add new field (examples, constraints, topics, companies, testcases)
  const addField = (section, template) => {
    setForm({ ...form, [section]: [...form[section], template] });
  };

  // Update hints
  const handleHintChange = (key, value) => {
    setForm({ ...form, hints: { ...form.hints, [key]: value } });
  };

  // Submit to backend
  const submitProblem = async () => {
    try {
      await axios.post(`${API}/problems`, form);
      alert("Problem created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error creating problem.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg space-y-8">

        <h1 className="text-4xl font-bold text-center text-[#0f2735]">
          Create Coding Problem
        </h1>

        {/* BASIC FIELDS */}
        <div className="space-y-4">
          <input
            name="slug"
            placeholder="Problem Slug (unique e.g., two-sum)"
            value={form.slug}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
          />

          <input
            name="title"
            placeholder="Problem Title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
          />

          {/* Difficulty */}
          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Description */}
          <textarea
            name="description"
            placeholder="Problem Description..."
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl h-32"
          ></textarea>
        </div>

        {/* EXAMPLES */}
        <section>
          <h2 className="text-2xl font-bold text-[#0f2735]">Examples</h2>

          {form.examples.map((ex, idx) => (
            <div key={idx} className="mt-4 p-4 border rounded-lg bg-gray-100">
              <input
                placeholder="Example Input"
                value={ex.input}
                onChange={(e) =>
                  handleNestedChange("examples", idx, "input", e.target.value)
                }
                className="w-full p-2 border rounded mb-2"
              />
              <input
                placeholder="Example Output"
                value={ex.output}
                onChange={(e) =>
                  handleNestedChange("examples", idx, "output", e.target.value)
                }
                className="w-full p-2 border rounded mb-2"
              />
              <textarea
                placeholder="Explanation"
                value={ex.explanation}
                onChange={(e) =>
                  handleNestedChange(
                    "examples",
                    idx,
                    "explanation",
                    e.target.value
                  )
                }
                className="w-full p-2 border rounded"
              ></textarea>
            </div>
          ))}

          <button
            onClick={() =>
              addField("examples", {
                input: "",
                output: "",
                explanation: "",
              })
            }
            className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-xl"
          >
            + Add Example
          </button>
        </section>

        {/* CONSTRAINTS */}
        <section>
          <h2 className="text-2xl font-bold text-[#0f2735]">Constraints</h2>

          {form.constraints.map((c, idx) => (
            <input
              key={idx}
              value={c}
              placeholder="Constraint"
              onChange={(e) =>
                handleNestedChange(
                  "constraints",
                  idx,
                  null,
                  (form.constraints[idx] = e.target.value)
                )
              }
              className="w-full p-2 border rounded mb-2"
            />
          ))}

          <button
            onClick={() => addField("constraints", "")}
            className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-xl"
          >
            + Add Constraint
          </button>
        </section>

        {/* TOPICS */}
        <section>
          <h2 className="text-2xl font-bold text-[#0f2735]">Topics</h2>

          {form.topics.map((t, idx) => (
            <input
              key={idx}
              value={t}
              placeholder="Topic (array, dp, hashmap...)"
              onChange={(e) =>
                handleNestedChange(
                  "topics",
                  idx,
                  null,
                  (form.topics[idx] = e.target.value)
                )
              }
              className="w-full p-2 border rounded mb-2"
            />
          ))}

          <button
            onClick={() => addField("topics", "")}
            className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-xl"
          >
            + Add Topic
          </button>
        </section>

        {/* COMPANIES */}
        <section>
          <h2 className="text-2xl font-bold text-[#0f2735]">Companies</h2>

          {form.companies.map((c, idx) => (
            <input
              key={idx}
              value={c}
              placeholder="Company (Google, Amazon...)"
              onChange={(e) =>
                handleNestedChange(
                  "companies",
                  idx,
                  null,
                  (form.companies[idx] = e.target.value)
                )
              }
              className="w-full p-2 border rounded mb-2"
            />
          ))}

          <button
            onClick={() => addField("companies", "")}
            className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-xl"
          >
            + Add Company
          </button>
        </section>

        {/* HINTS */}
        <section>
          <h2 className="text-2xl font-bold text-[#0f2735]">Hints</h2>

          <input
            placeholder="Hint 1"
            value={form.hints.h1}
            onChange={(e) => handleHintChange("h1", e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            placeholder="Hint 2"
            value={form.hints.h2}
            onChange={(e) => handleHintChange("h2", e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            placeholder="Hint 3"
            value={form.hints.h3}
            onChange={(e) => handleHintChange("h3", e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
        </section>

        {/* TESTCASES */}
        <section>
          <h2 className="text-2xl font-bold text-[#0f2735]">Testcases</h2>

          {form.testcases.map((tc, idx) => (
            <div key={idx} className="mt-4 p-4 border rounded-lg bg-gray-100">
              <input
                placeholder="Test Input"
                value={tc.input}
                onChange={(e) =>
                  handleNestedChange("testcases", idx, "input", e.target.value)
                }
                className="w-full p-2 border rounded mb-2"
              />
              <input
                placeholder="Expected Output"
                value={tc.output}
                onChange={(e) =>
                  handleNestedChange("testcases", idx, "output", e.target.value)
                }
                className="w-full p-2 border rounded mb-2"
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={tc.hidden}
                  onChange={(e) =>
                    handleNestedChange(
                      "testcases",
                      idx,
                      "hidden",
                      e.target.checked
                    )
                  }
                />
                Hidden Testcase
              </label>
            </div>
          ))}

          <button
            onClick={() =>
              addField("testcases", {
                input: "",
                output: "",
                hidden: false,
              })
            }
            className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-xl"
          >
            + Add Testcase
          </button>
        </section>

        {/* SUBMIT BUTTON */}
        <button
          onClick={submitProblem}
          className="w-full bg-[#0f2735] hover:bg-black text-white py-4 rounded-xl text-xl font-bold"
        >
          Submit Problem
        </button>
      </div>
    </div>
  );
};

export default createprogram;
