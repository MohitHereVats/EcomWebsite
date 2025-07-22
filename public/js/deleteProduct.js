const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

  fetch("/admin/delete-product", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      'x-csrf-token': csrf  // Changed from 'csrf-token' to 'x-csrf-token'
    },
    body: JSON.stringify({ productId }),
    // body: { productId: productId }
  })
    .then((result) => {
      console.log("Delete result: ", result);  
      return result.json();
    })
    .then((data) => {
      console.log("Delete response: ", data);
      if (data.success) {
        btn.closest("article").remove();
      } else {
        alert("Failed to delete the product.");
      }
    })
    .catch((err) => {
      console.error("Error deleting product: ", err);
    });
};
