import CuentasPage from "../../../components/CuentasPage/CuentasPage";

import {
  getGastos,
  addPago,
  removePago
} from "../../../services/gastoService";

function CuentasPorPagar() {
  return (
    <CuentasPage
      titulo="Cuentas por pagar"
      descripcion="Lo que le debes a tus proveedores por gastos a crédito"
      contactoLabel="Proveedor"
      resumenLabel="Total por pagar"
      getItems={getGastos}
      addPago={addPago}
      removePago={removePago}
      getContacto={(gasto) => gasto.proveedorName}
      getDetalle={(gasto) => gasto.description}
    />
  );
}

export default CuentasPorPagar;
