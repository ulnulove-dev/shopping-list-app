const SUPABASE_URL = "https://lxzikrcvtmntjpknxpni.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4emlrcmN2dG1udGpwa254cG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU2MjAsImV4cCI6MjA5ODI1MTYyMH0.0LeUhdroTXWKv-Eh7y6K0ddlXXITM9K3V3_VIudWR_c";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("add-form");
const input = document.getElementById("item-input");
const list = document.getElementById("item-list");
const emptyMessage = document.getElementById("empty-message");

let items = [];

async function loadItems() {
  const { data, error } = await client
    .from("shopping_items")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) { console.error(error); return; }
  items = data;
  render();
}

function render() {
  list.innerHTML = "";
  emptyMessage.style.display = items.length === 0 ? "block" : "none";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "item" + (item.checked ? " checked" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.checked;
    checkbox.addEventListener("change", () => toggleItem(item.id));

    const span = document.createElement("span");
    span.textContent = item.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => deleteItem(item.id));

    li.append(checkbox, span, deleteBtn);
    list.appendChild(li);
  });
}

async function addItem(text) {
  const { data, error } = await client
    .from("shopping_items")
    .insert({ text, checked: false })
    .select()
    .single();
  if (error) { console.error(error); return; }
  items.push(data);
  render();
}

async function toggleItem(id) {
  const item = items.find((i) => i.id === id);
  if (!item) return;
  const { error } = await client
    .from("shopping_items")
    .update({ checked: !item.checked })
    .eq("id", id);
  if (error) { console.error(error); return; }
  item.checked = !item.checked;
  render();
}

async function deleteItem(id) {
  const { error } = await client
    .from("shopping_items")
    .delete()
    .eq("id", id);
  if (error) { console.error(error); return; }
  items = items.filter((i) => i.id !== id);
  render();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  await addItem(text);
  input.value = "";
  input.focus();
});

loadItems();
