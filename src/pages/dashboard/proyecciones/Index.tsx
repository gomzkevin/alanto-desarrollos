
import React, { useState } from 'react';
import {
  Card,
  Text,
  Title,
  BarChart,
  AreaChart,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  BarList,
  DateRangePicker,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  ProgressBar,
} from "@/components/ui/chart";
import type { DateRangePickerValue } from "@/components/ui/chart";
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageIcon } from "lucide-react";
import { CardHeader, CardTitle, CardDescription, CardContent as ShadCardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption,
  TableCell as ShadTableCell,
  TableFooter,
  TableHead as ShadTableHead,
  TableHeader as ShadTableHeader,
  TableRow as ShadTableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Copy, Edit, Share2, Trash2 } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ExportPDFButton } from "@/components/dashboard/ExportPDFButton";

// Mock data for charts
const generateRandomData = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    name: `Category ${i + 1}`,
    value: Math.floor(Math.random() * 100),
  }));
};

// Sample data for bar chart
const barChartData = [
  {
    name: "Ene",
    Ventas: 2400,
    Objetivo: 2800,
  },
  {
    name: "Feb",
    Ventas: 1398,
    Objetivo: 2000,
  },
  {
    name: "Mar",
    Ventas: 9800,
    Objetivo: 8000,
  },
  {
    name: "Abr",
    Ventas: 3908,
    Objetivo: 4000,
  },
  {
    name: "May",
    Ventas: 4800,
    Objetivo: 5000,
  },
  {
    name: "Jun",
    Ventas: 3800,
    Objetivo: 4000,
  },
];

// Sample data for area chart
const areaChartData = [
  {
    date: "Ene 22",
    Ingresos: 4000,
    Gastos: 2400,
  },
  {
    date: "Feb 22",
    Ingresos: 3000,
    Gastos: 1398,
  },
  {
    date: "Mar 22",
    Ingresos: 12000,
    Gastos: 9800,
  },
  {
    date: "Abr 22",
    Ingresos: 8000,
    Gastos: 3908,
  },
  {
    date: "May 22",
    Ingresos: 6000,
    Gastos: 4800,
  },
  {
    date: "Jun 22", 
    Ingresos: 5000,
    Gastos: 3800,
  },
];

// Sample data for table
const tableData = [
  { id: 1, proyecto: "Proyecto A", presupuesto: "$250,000", completado: "75%" },
  { id: 2, proyecto: "Proyecto B", presupuesto: "$350,000", completado: "45%" },
  { id: 3, proyecto: "Proyecto C", presupuesto: "$180,000", completado: "90%" },
  { id: 4, proyecto: "Proyecto D", presupuesto: "$420,000", completado: "10%" },
  { id: 5, proyecto: "Proyecto E", presupuesto: "$195,000", completado: "60%" },
];

const ProyeccionesPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2023, 0, 1),
    to: new Date(),
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const generateProjection = () => {
    toast({
      title: "Proyección generada",
      description: "La proyección ha sido generada con éxito.",
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Proyecciones Financieras</h1>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Nueva Proyección</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Proyección</DialogTitle>
                  <DialogDescription>
                    Complete los campos para generar una nueva proyección financiera.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre
                    </Label>
                    <Input id="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Tipo
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ventas">Ventas</SelectItem>
                        <SelectItem value="ingresos">Ingresos</SelectItem>
                        <SelectItem value="gastos">Gastos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="period" className="text-right">
                      Período
                    </Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                  {format(dateRange.to, "LLL dd, y", { locale: es })}
                                </>
                              ) : (
                                format(dateRange.from, "LLL dd, y", { locale: es })
                              )
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            initialFocus
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={generateProjection}>Generar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <ExportPDFButton 
              resourceName="proyección"
              buttonText="Exportar PDF"
            />
          </div>
        </div>
        
        <TabGroup>
          <TabList className="mb-6">
            <Tab>Dashboard</Tab>
            <Tab>Detalles</Tab>
            <Tab>Reportes</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                  <div className="p-6">
                    <Title>Ventas Totales</Title>
                    <Text>Último trimestre</Text>
                    <div className="mt-4 flex items-center">
                      <span className="text-3xl font-bold">$846,589</span>
                      <Badge className="ml-3" variant="secondary">+12.5%</Badge>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="p-6">
                    <Title>Unidades Vendidas</Title>
                    <Text>Último trimestre</Text>
                    <div className="mt-4 flex items-center">
                      <span className="text-3xl font-bold">1,423</span>
                      <Badge className="ml-3" variant="secondary">+8.2%</Badge>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="p-6">
                    <Title>Ticket Promedio</Title>
                    <Text>Último trimestre</Text>
                    <div className="mt-4 flex items-center">
                      <span className="text-3xl font-bold">$595</span>
                      <Badge className="ml-3" variant="secondary">+3.7%</Badge>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <Card>
                  <div className="p-6">
                    <Title>Ventas vs Objetivo</Title>
                    <Text>Evolución mensual</Text>
                    <BarChart
                      className="mt-4 h-72"
                      data={barChartData}
                      index="name"
                      categories={["Ventas", "Objetivo"]}
                      colors={["blue", "indigo"]}
                    />
                  </div>
                </Card>
                <Card>
                  <div className="p-6">
                    <Title>Ingresos y Gastos</Title>
                    <Text>Evolución mensual</Text>
                    <AreaChart
                      className="mt-4 h-72"
                      data={areaChartData}
                      index="date"
                      categories={["Ingresos", "Gastos"]}
                      colors={["emerald", "rose"]}
                    />
                  </div>
                </Card>
              </div>
              
              <Card>
                <div className="p-6">
                  <Title>Proyectos Actuales</Title>
                  <Text>Estado y presupuesto</Text>
                  <Table className="mt-4">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Proyecto</TableHeaderCell>
                        <TableHeaderCell>Presupuesto</TableHeaderCell>
                        <TableHeaderCell>Completado</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.proyecto}</TableCell>
                          <TableCell>{item.presupuesto}</TableCell>
                          <TableCell>{item.completado}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabPanel>
            
            <TabPanel>
              <Card>
                <div className="p-6">
                  <Title>Detalles de Proyecciones</Title>
                  <Text>Información completa de proyecciones financieras</Text>
                  
                  <div className="mt-6">
                    <p>Esta sección mostrará análisis detallados de las proyecciones.</p>
                  </div>
                </div>
              </Card>
            </TabPanel>
            
            <TabPanel>
              <Card>
                <div className="p-6">
                  <Title>Reportes de Proyecciones</Title>
                  <Text>Informes generados a partir de las proyecciones</Text>
                  
                  <div className="mt-6">
                    <p>Esta sección contendrá reportes descargables y análisis automáticos.</p>
                  </div>
                </div>
              </Card>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </DashboardLayout>
  );
};

export { ProyeccionesPage };
