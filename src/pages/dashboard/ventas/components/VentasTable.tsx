
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VentasTable = () => {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  
  // Datos de ejemplo - estos vendrían de un hook useVentas
  const ventas = [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Input
            placeholder="Buscar venta..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="en_proceso">En proceso</SelectItem>
              <SelectItem value="completada">Completada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button asChild>
          <Link to="/dashboard/ventas/nueva">
            Nueva Venta
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Desarrollo/Prototipo</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Precio Total</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ventas.length > 0 ? (
              ventas.map((venta) => (
                <TableRow key={venta.id}>
                  <TableCell>
                    <div className="font-medium">{venta.desarrollo}</div>
                    <div className="text-sm text-muted-foreground">{venta.prototipo}</div>
                  </TableCell>
                  <TableCell>{venta.unidad}</TableCell>
                  <TableCell>
                    {venta.es_fraccional ? "Fraccional" : "Individual"}
                  </TableCell>
                  <TableCell>${venta.precio_total.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={venta.progreso} className="w-[60px]" />
                      <span className="text-xs">{venta.progreso}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={venta.estado === "completada" ? "success" : "default"}
                    >
                      {venta.estado === "en_proceso" ? "En proceso" : "Completada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link to={`/dashboard/ventas/${venta.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link to={`/dashboard/ventas/${venta.id}/pagos`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No hay ventas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VentasTable;
