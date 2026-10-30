import CuentasPage from "../../../components/CuentasPage/CuentasPage";

import {
  getVentas,
  addPago,
  removePago
} from "../../../services/ventaService";

function CuentasPorCobrar() {
  return (
    <CuentasPage
      titulo="Cuentas por cobrar"
      descripcion="Lo que tus clientes te deben por ventas a crédito"
      contactoLabel="Cliente"
      resumenLabel="Total por cobrar"
      getItems={getVentas}
      addPago={addPago}
      removePago={removePago}
      getContacto={(venta) => venta.clienteName}
      getDetalle={(venta) =>
        venta.items
          .map((item) => `${item.quantity} × ${item.name}`)
          .join(", ")
      }
    />
  );
}

export default CuentasPorCobrar;
