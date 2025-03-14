import React, { useState, useEffect } from 'react';
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
  DateRangePickerValue,
  Button,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  ProgressBar,
} from "@/components/ui/chart";
import { mock } from 'mockjs';
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
import { enUS, es } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  PopoverArrow,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Progress } from "@/components/ui/progress"
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton"
import { useOrigin } from "@/hooks/use-origin"
import { useCompletion } from 'ai/react'
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ImageIcon } from "lucide-react"
import { CardHeader, CardTitle, CardDescription, CardContent as ShadCardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Table as ShadTable,
  TableBody as ShadTableBody,
  TableCaption,
  TableCell as ShadTableCell,
  TableFooter,
  TableHead as ShadTableHead,
  TableHeader as ShadTableHeader,
  TableRow as ShadTableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "@/components/ui/alert-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autocomplete from 'accessible-autocomplete/react'
import 'accessible-autocomplete/dist/accessible-autocomplete.min.css'
import { useDebounce } from "@/hooks/use-debounce"
import { useCopyToClipboard } from 'usehooks-ts'
import { Copy, Edit, Share2, Trash2 } from "lucide-react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ResizableSeparator,
} from "@/components/ui/resizable"
import { useTheme } from "@/components/theme-provider"
import { SkeletonCard } from "@/components/SkeletonCard"
import { SkeletonTable } from "@/components/SkeletonTable"
import { SkeletonList } from "@/components/SkeletonList"
import { SkeletonForm } from "@/components/SkeletonForm"
import { SkeletonCalendar } from "@/components/SkeletonCalendar"
import { SkeletonChart } from "@/components/SkeletonChart"
import { SkeletonAccordion } from "@/components/SkeletonAccordion"
import { SkeletonCommand } from "@/components/SkeletonCommand"
import { SkeletonDialog } from "@/components/SkeletonDialog"
import { SkeletonDrawer } from "@/components/SkeletonDrawer"
import { SkeletonHoverCard } from "@/components/SkeletonHoverCard"
import { SkeletonProgress } from "@/components/SkeletonProgress"
import { SkeletonRadioGroup } from "@/components/SkeletonRadioGroup"
import { SkeletonScrollArea } from "@/components/SkeletonScrollArea"
import { SkeletonSelect } from "@/components/SkeletonSelect"
import { SkeletonSheet } from "@/components/SkeletonSheet"
import { SkeletonSlider } from "@/components/SkeletonSlider"
import { SkeletonTabs } from "@/components/SkeletonTabs"
import { SkeletonTooltip } from "@/components/SkeletonTooltip"
import { SkeletonCarousel } from "@/components/SkeletonCarousel"
import { SkeletonResizable } from "@/components/SkeletonResizable"
import { SkeletonDropdownMenu } from "@/components/SkeletonDropdownMenu"
import { SkeletonAlertDialog } from "@/components/SkeletonAlertDialog"
import { SkeletonCollapsible } from "@/components/SkeletonCollapsible"
import { SkeletonCarouselItem } from "@/components/SkeletonCarouselItem"
import { SkeletonResizablePanel } from "@/components/SkeletonResizablePanel"
import { SkeletonResizablePanelGroup } from "@/components/SkeletonResizablePanelGroup"
import { SkeletonResizableSeparator } from "@/components/SkeletonResizableSeparator"
import { SkeletonResizableHandle } from "@/components/SkeletonResizableHandle"
import { SkeletonCardHeader } from "@/components/SkeletonCardHeader"
import { SkeletonCardTitle } from "@/components/SkeletonCardTitle"
import { SkeletonCardDescription } from "@/components/SkeletonCardDescription"
import { SkeletonCardContent } from "@/components/SkeletonCardContent"
import { SkeletonCardFooter } from "@/components/SkeletonCardFooter"
import { SkeletonTableCaption } from "@/components/SkeletonTableCaption"
import { SkeletonTableHead } from "@/components/SkeletonTableHead"
import { SkeletonTableHeader } from "@/components/SkeletonTableHeader"
import { SkeletonTableRow } from "@/components/SkeletonTableRow"
import { SkeletonTableCell } from "@/components/SkeletonTableCell"
import { SkeletonTableBody } from "@/components/SkeletonTableBody"
import { SkeletonTableFooter } from "@/components/SkeletonTableFooter"
import { SkeletonCommandEmpty } from "@/components/SkeletonCommandEmpty"
import { SkeletonCommandGroup } from "@/components/SkeletonCommandGroup"
import { SkeletonCommandInput } from "@/components/SkeletonCommandInput"
import { SkeletonCommandItem } from "@/components/SkeletonCommandItem"
import { SkeletonCommandList } from "@/components/SkeletonCommandList"
import { SkeletonCommandSeparator } from "@/components/SkeletonCommandSeparator"
import { SkeletonCommandShortcut } from "@/components/SkeletonCommandShortcut"
import { SkeletonDrawerClose } from "@/components/SkeletonDrawerClose"
import { SkeletonDrawerContent } from "@/components/SkeletonDrawerContent"
import { SkeletonDrawerDescription } from "@/components/SkeletonDrawerDescription"
import { SkeletonDrawerFooter } from "@/components/SkeletonDrawerFooter"
import { SkeletonDrawerHeader } from "@/components/SkeletonDrawerHeader"
import { SkeletonDrawerTitle } from "@/components/SkeletonDrawerTitle"
import { SkeletonDrawerTrigger } from "@/components/SkeletonDrawerTrigger"
import { SkeletonPopoverArrow } from "@/components/SkeletonPopoverArrow"
import { SkeletonAccordionContent } from "@/components/SkeletonAccordionContent"
import { SkeletonAccordionItem } from "@/components/SkeletonAccordionItem"
import { SkeletonAccordionTrigger } from "@/components/SkeletonAccordionTrigger"
import { SkeletonAlertDialogAction } from "@/components/SkeletonAlertDialogAction"
import { SkeletonAlertDialogCancel } from "@/components/SkeletonAlertDialogCancel"
import { SkeletonAlertDialogContent } from "@/components/SkeletonAlertDialogContent"
import { SkeletonAlertDialogDescription } from "@/components/SkeletonAlertDialogDescription"
import { SkeletonAlertDialogFooter } from "@/components/SkeletonAlertDialogFooter"
import { SkeletonAlertDialogHeader } from "@/components/SkeletonAlertDialogHeader"
import { SkeletonAlertDialogTitle } from "@/components/SkeletonAlertDialogTitle"
import { SkeletonAlertDialogTrigger } from "@/components/SkeletonAlertDialogTrigger"
import { SkeletonCollapsibleContent } from "@/components/SkeletonCollapsibleContent"
import { SkeletonCollapsibleTrigger } from "@/components/SkeletonCollapsibleTrigger"
import { SkeletonDropdownMenuCheckboxItem } from "@/components/SkeletonDropdownMenuCheckboxItem"
import { SkeletonDropdownMenuContent } from "@/components/SkeletonDropdownMenuContent"
import { SkeletonDropdownMenuItem } from "@/components/SkeletonDropdownMenuItem"
import { SkeletonDropdownMenuLabel } from "@/components/SkeletonDropdownMenuLabel"
import { SkeletonDropdownMenuSeparator } from "@/components/SkeletonDropdownMenuSeparator"
import { SkeletonDropdownMenuTrigger } from "@/components/SkeletonDropdownMenuTrigger"
import { SkeletonHoverCardContent } from "@/components/SkeletonHoverCardContent"
import { SkeletonHoverCardTrigger } from "@/components/SkeletonHoverCardTrigger"
import { SkeletonRadioGroupItem } from "@/components/SkeletonRadioGroupItem"
import { SkeletonSheetClose } from "@/components/SkeletonSheetClose"
import { SkeletonSheetContent } from "@/components/SkeletonSheetContent"
import { SkeletonSheetDescription } from "@/components/SkeletonSheetDescription"
import { SkeletonSheetFooter } from "@/components/SkeletonSheetFooter"
import { SkeletonSheetHeader } from "@/components/SkeletonSheetHeader"
import { SkeletonSheetTitle } from "@/components/SkeletonSheetTitle"
import { SkeletonSheetTrigger } from "@/components/SkeletonSheetTrigger"
import { SkeletonTextarea } from "@/components/SkeletonTextarea"
import { SkeletonSwitch } from "@/components/SkeletonSwitch"
import { SkeletonSeparator } from "@/components/SkeletonSeparator"
import { SkeletonFormDescription } from "@/components/SkeletonFormDescription"
import { SkeletonFormItem } from "@/components/SkeletonFormItem"
import { SkeletonFormLabel } from "@/components/SkeletonFormLabel"
import { SkeletonFormMessage } from "@/components/SkeletonFormMessage"
import { SkeletonFormControl } from "@/components/SkeletonFormControl"
import { SkeletonCheckbox } from "@/components/SkeletonCheckbox"
import { SkeletonBadge } from "@/components/SkeletonBadge"
import { SkeletonButton } from "@/components/SkeletonButton"
import { SkeletonInput } from "@/components/SkeletonInput"
import { SkeletonLabel } from "@/components/SkeletonLabel"
import { SkeletonPopoverContent } from "@/components/SkeletonPopoverContent"
import { SkeletonPopoverTrigger } from "@/components/SkeletonPopoverTrigger"
import { SkeletonSelectContent } from "@/components/SkeletonSelectContent"
import { SkeletonSelectItem } from "@/components/SkeletonSelectItem"
import { SkeletonSelectTrigger } from "@/components/SkeletonSelectTrigger"
import { SkeletonSelectValue } from "@/components/SkeletonSelectValue"
import { SkeletonCalendarIcon } from "@/components/SkeletonCalendarIcon"
import { SkeletonPlus } from "@/components/SkeletonPlus"
import { SkeletonFileText } from "@/components/SkeletonFileText"
import { SkeletonCopy } from "@/components/SkeletonCopy"
import { SkeletonEdit } from "@/components/SkeletonEdit"
import { SkeletonShare2 } from "@/components/SkeletonShare2"
import { SkeletonTrash2 } from "@/components/SkeletonTrash2"
import { SkeletonImageIcon } from "@/components/SkeletonImageIcon"
import { SkeletonCheck } from "@/components/SkeletonCheck"
import { SkeletonCarouselNext } from "@/components/SkeletonCarouselNext"
import { SkeletonCarouselPrevious } from "@/components/SkeletonCarouselPrevious"
import { SkeletonRadioGroup } from "@/components/SkeletonRadioGroup"
import { SkeletonRadioGroupItem } from "@/components/SkeletonRadioGroupItem"
import { SkeletonDropdownMenuRadioItem } from "@/components/SkeletonDropdownMenuRadioItem"
import { SkeletonDropdownMenuShortcut } from "@/components/SkeletonDropdownMenuShortcut"
import { SkeletonCircle } from "@/components/SkeletonCircle"
import { SkeletonChevronRight } from "@/components/SkeletonChevronRight"
import { SkeletonAspectRatio } from "@/components/SkeletonAspectRatio"
import { SkeletonAutocomplete } from "@/components/SkeletonAutocomplete"
import { SkeletonCarouselContent } from "@/components/SkeletonCarouselContent"
import { SkeletonCarouselItem } from "@/components/SkeletonCarouselItem"
import { SkeletonCommandList } from "@/components/SkeletonCommandList"
import { SkeletonCommandItem } from "@/components/SkeletonCommandItem"
import { SkeletonCommandEmpty } from "@/components/SkeletonCommandEmpty"
import { SkeletonCommandGroup } from "@/components/SkeletonCommandGroup"
import { SkeletonCommandInput } from "@/components/SkeletonCommandInput"
import { SkeletonCommandSeparator } from "@/components/SkeletonCommandSeparator"
import { SkeletonCommandShortcut } from "@/components/SkeletonCommandShortcut"
import { SkeletonDrawerClose } from "@/components/SkeletonDrawerClose"
import { SkeletonDrawerContent } from "@/components/SkeletonDrawerContent"
import { SkeletonDrawerDescription } from "@/components/SkeletonDrawerDescription"
import { SkeletonDrawerFooter } from "@/components/SkeletonDrawerFooter"
import { SkeletonDrawerHeader } from "@/components/SkeletonDrawerHeader"
import { SkeletonDrawerTitle } from "@/components/SkeletonDrawerTitle"
import { SkeletonDrawerTrigger } from "@/components/SkeletonDrawerTrigger"
import { SkeletonPopoverArrow } from "@/components/SkeletonPopoverArrow"
import { SkeletonAccordionContent } from "@/components/SkeletonAccordionContent"
import { SkeletonAccordionItem } from "@/components/SkeletonAccordionItem"
import { SkeletonAccordionTrigger } from "@/components/SkeletonAccordionTrigger"
import { SkeletonAlertDialogAction } from "@/components/SkeletonAlertDialogAction"
import { SkeletonAlertDialogCancel } from "@/components/SkeletonAlertDialogCancel"
import { SkeletonAlertDialogContent } from "@/components/SkeletonAlertDialogContent"
import { SkeletonAlertDialogDescription } from "@/components/SkeletonAlertDialogDescription"
import { SkeletonAlertDialogFooter } from "@/components/SkeletonAlertDialogFooter"
import { SkeletonAlertDialogHeader } from "@/components/SkeletonAlertDialogHeader"
import { SkeletonAlertDialogTitle } from "@/components/SkeletonAlertDialogTitle"
import { SkeletonAlertDialogTrigger } from "@/components/SkeletonAlertDialogTrigger"
import { SkeletonCollapsibleContent } from "@/components/SkeletonCollapsibleContent"
import { SkeletonCollapsibleTrigger } from "@/components/SkeletonCollapsibleTrigger"
import { SkeletonDropdownMenuCheckboxItem } from "@/components/SkeletonDropdownMenuCheckboxItem"
import { SkeletonDropdownMenuContent } from "@/components/SkeletonDropdownMenuContent"
import { SkeletonDropdownMenuItem } from "@/components/SkeletonDropdownMenuItem"
import { SkeletonDropdownMenuLabel } from "@/components/SkeletonDropdownMenuLabel"
import { SkeletonDropdownMenuSeparator } from "@/components/SkeletonDropdownMenuSeparator"
import { SkeletonDropdownMenuTrigger } from "@/components/SkeletonDropdownMenuTrigger"
import { SkeletonHoverCardContent } from "@/components/SkeletonHoverCardContent"
import { SkeletonHoverCardTrigger } from "@/components/SkeletonHoverCardTrigger"
import { SkeletonRadioGroupItem } from "@/components/SkeletonRadioGroupItem"
import { SkeletonSheetClose } from "@/components/SkeletonSheetClose"
import { SkeletonSheetContent } from "@/components/SkeletonSheetContent"
import { SkeletonSheetDescription from "@/components/SkeletonSheetDescription"
import { SkeletonSheetFooter } from "@/components/SkeletonSheetFooter"
import { SkeletonSheetHeader } from "@/components/SkeletonSheetHeader"
import { SkeletonSheetTitle } from "@/components/SkeletonSheetTitle"
import { SkeletonSheetTrigger } from "@/components/SkeletonSheetTrigger"
import { SkeletonTextarea } from "@/components/SkeletonTextarea"
import { SkeletonSwitch } from "@/components/SkeletonSwitch"
import { SkeletonSeparator } from "@/components/SkeletonSeparator"
import { SkeletonFormDescription } from "@/components/SkeletonFormDescription"
import { SkeletonFormItem } from "@/components/SkeletonFormItem"
import { SkeletonFormLabel } from "@/components/SkeletonFormLabel"
import { SkeletonFormMessage } from "@/components/SkeletonFormMessage"
import { SkeletonFormControl } from "@/components/SkeletonFormControl"
import { SkeletonCheckbox } from "@/components/SkeletonCheckbox"
import { SkeletonBadge } from "@/components/SkeletonBadge"
import { SkeletonButton } from "@/components/SkeletonButton"
import { SkeletonInput } from "@/components/SkeletonInput"
import { SkeletonLabel } from "@/components/SkeletonLabel"
import { SkeletonPopoverContent } from "@/components/SkeletonPopoverContent"
import { SkeletonPopoverTrigger } from "@/components/SkeletonPopoverTrigger"
import { SkeletonSelectContent } from "@/components/SkeletonSelectContent"
import { SkeletonSelectItem } from "@/components/SkeletonSelectItem"
import { SkeletonSelectTrigger } from "@/components/SkeletonSelectTrigger"
import { SkeletonSelectValue } from "@/components/SkeletonSelectValue"
import { SkeletonCalendarIcon } from "@/components/SkeletonCalendarIcon"
import { SkeletonPlus } from "@/components/SkeletonPlus"
import { SkeletonFileText } from "@/components/SkeletonFileText"
import { SkeletonCopy } from "@/components/SkeletonCopy"
import { SkeletonEdit } from "@/components/SkeletonEdit"
import { SkeletonShare2 } from "@/components/SkeletonShare2"
import { SkeletonTrash2 } from "@/components/SkeletonTrash2"
import { SkeletonImageIcon } from "@/components/SkeletonImageIcon"
import { SkeletonCheck } from "@/components/SkeletonCheck"
import { SkeletonCarouselNext } from "@/components/SkeletonCarouselNext"
import { SkeletonCarouselPrevious } from "@/components/SkeletonCarouselPrevious"
import { SkeletonRadioGroup } from "@/components/SkeletonRadioGroup"
import { SkeletonRadioGroupItem } from "@/components/SkeletonRadioGroupItem"
import { SkeletonDropdownMenuRadioItem } from "@/components/SkeletonDropdownMenuRadioItem"
import { SkeletonDropdownMenuShortcut } from "@/components/SkeletonDropdownMenuShortcut"
import { SkeletonCircle } from "@/components/SkeletonCircle"
import { SkeletonChevronRight } from "@/components/SkeletonChevronRight"
import { SkeletonAspectRatio } from "@/components/SkeletonAspectRatio"
import { SkeletonAutocomplete } from "@/components/SkeletonAutocomplete"
import { SkeletonCarouselContent } from "@/components/SkeletonCarouselContent"
import { SkeletonCarouselItem } from "@/components/SkeletonCarouselItem"
import { SkeletonCommandList } from "@/components/SkeletonCommandList"
import { SkeletonCommandItem } from "@/components/SkeletonCommandItem"
import { SkeletonCommandEmpty } from "@/components/SkeletonCommandEmpty"
import { SkeletonCommandGroup } from "@/components/SkeletonCommandGroup"
import { SkeletonCommandInput } from "@/components/SkeletonCommandInput"
import { SkeletonCommandSeparator } from "@/components/SkeletonCommandSeparator"
import { SkeletonCommandShortcut } from "@/components/SkeletonCommandShortcut"
import { SkeletonDrawerClose } from "@/components/SkeletonDrawerClose"
import { SkeletonDrawerContent } from "@/components/SkeletonDrawerContent"
import { SkeletonDrawerDescription } from "@/components/SkeletonDrawerDescription"
import { SkeletonDrawerFooter } from "@/components/SkeletonDrawerFooter"
import { SkeletonDrawerHeader } from "@/components/SkeletonDrawerHeader"
import { SkeletonDrawerTitle } from "@/components/SkeletonDrawerTitle"
import { SkeletonDrawerTrigger } from "@/components/SkeletonDrawerTrigger"
import { SkeletonPopoverArrow } from "@/components/SkeletonPopoverArrow"
import { SkeletonAccordionContent } from "@/components/SkeletonAccordionContent"
import { SkeletonAccordionItem } from "@/components/SkeletonAccordionItem"
import { SkeletonAccordionTrigger } from "@/components/SkeletonAccordionTrigger"
import { SkeletonAlertDialogAction } from "@/components/SkeletonAlertDialogAction"
import { SkeletonAlertDialogCancel from "@/components/SkeletonAlertDialogCancel"
import { SkeletonAlertDialogContent } from "@/components/SkeletonAlertDialogContent"
import { SkeletonAlertDialogDescription } from "@/components/SkeletonAlertDialogDescription"
import { SkeletonAlertDialogFooter } from "@/components/SkeletonAlertDialogFooter"
import { SkeletonAlertDialogHeader } from "@/components/SkeletonAlertDialogHeader"
import { SkeletonAlertDialogTitle } from "@/components/SkeletonAlertDialogTitle"
import { SkeletonAlertDialogTrigger } from "@/components/SkeletonAlertDialogTrigger"
import { SkeletonCollapsibleContent } from "@/components/SkeletonCollapsibleContent"
import { SkeletonCollapsibleTrigger } from "@/components/SkeletonCollapsibleTrigger"
import { SkeletonDropdownMenuCheckboxItem } from "@/components/SkeletonDropdownMenuCheckboxItem"
import { SkeletonDropdownMenuContent } from "@/components/SkeletonDropdownMenuContent"
import { SkeletonDropdownMenuItem } from "@/components/SkeletonDropdownMenuItem"
import { SkeletonDropdownMenuLabel } from "@/components/SkeletonDropdownMenuLabel"
import { SkeletonDropdownMenuSeparator } from "@/components/SkeletonDropdownMenuSeparator"
import { SkeletonDropdownMenuTrigger } from "@/components/SkeletonDropdownMenuTrigger"
import { SkeletonHoverCardContent } from "@/components/SkeletonHoverCardContent"
import { SkeletonHoverCardTrigger } from "@/components/SkeletonHoverCardTrigger"
import { SkeletonRadioGroupItem } from "@/components/SkeletonRadioGroupItem"
import { SkeletonSheetClose } from "@/components/SkeletonSheetClose"
import { SkeletonSheetContent } from "@/components/SkeletonSheetContent"
import { SkeletonSheetDescription } from "@/components/SkeletonSheetDescription"
import { SkeletonSheetFooter } from "@/components/SkeletonSheetFooter"
import { SkeletonSheetHeader } from "@/components/SkeletonSheetHeader"
import { SkeletonSheetTitle } from "@/components/SkeletonSheetTitle"
import { SkeletonSheetTrigger } from "@/components/SkeletonSheetTrigger"
import { SkeletonTextarea } from "@/components/SkeletonTextarea"
import { SkeletonSwitch } from "@/components/SkeletonSwitch"
import { SkeletonSeparator } from "@/components/SkeletonSeparator"
import { SkeletonFormDescription } from "@/components/SkeletonFormDescription"
import { SkeletonFormItem } from "@/components/SkeletonFormItem"
import { SkeletonFormLabel } from "@/components/SkeletonFormLabel"
import { SkeletonFormMessage } from "@/components/SkeletonFormMessage"
import { SkeletonFormControl } from "@/components/SkeletonFormControl"
import { SkeletonCheckbox } from "@/components/SkeletonCheckbox"
import { SkeletonBadge } from "@/components/SkeletonBadge"
import { SkeletonButton } from "@/components/SkeletonButton"
import { SkeletonInput } from "@/components/SkeletonInput"
import { SkeletonLabel } from "@/components/SkeletonLabel"
import { SkeletonPopoverContent } from "@/components/SkeletonPopoverContent"
import { SkeletonPopoverTrigger } from "@/components/SkeletonPopoverTrigger"
import { SkeletonSelectContent } from "@/components/SkeletonSelectContent"
import { SkeletonSelectItem } from "@/components/SkeletonSelectItem"
import { SkeletonSelectTrigger } from "@/components/SkeletonSelectTrigger"
import { SkeletonSelectValue } from "@/components/SkeletonSelectValue"
import { SkeletonCalendarIcon } from "@/components/SkeletonCalendarIcon"
import { SkeletonPlus } from "@/components/SkeletonPlus"
import { SkeletonFileText } from "@/components/SkeletonFileText"
import { SkeletonCopy } from "@/components/SkeletonCopy"
import { SkeletonEdit } from "@/components/SkeletonEdit"
import { SkeletonShare2 } from "@/components/SkeletonShare2"
import { SkeletonTrash2 } from "@/components/SkeletonTrash2"
import { SkeletonImageIcon } from "@/components/SkeletonImageIcon"
import { SkeletonCheck } from "@/components/SkeletonCheck"
import { SkeletonCarouselNext } from "@/components/SkeletonCarouselNext"
import { SkeletonCarouselPrevious } from "@/components/SkeletonCarouselPrevious"
import { SkeletonRadioGroup } from "@/components/SkeletonRadioGroup"
import { SkeletonRadioGroupItem } from "@/components/SkeletonRadioGroupItem"
import { SkeletonDropdownMenuRadioItem } from "@/components/SkeletonDropdownMenuRadioItem"
import { SkeletonDropdownMenuShortcut } from "@/components/SkeletonDropdownMenuShortcut"
import { SkeletonCircle } from "@/components/SkeletonCircle"
import { SkeletonChevronRight } from "@/components/SkeletonChevronRight"
import { SkeletonAspectRatio } from "@/components/SkeletonAspectRatio"
import { SkeletonAutocomplete } from "@/components/SkeletonAutocomplete"
import { SkeletonCarouselContent } from "@/components/SkeletonCarouselContent"
import { SkeletonCarouselItem } from "@/components/SkeletonCarouselItem"
import { SkeletonCommandList } from "@/components/SkeletonCommandList"
import { SkeletonCommandItem } from "@/components/SkeletonCommandItem"
import { SkeletonCommandEmpty } from "@/components/SkeletonCommandEmpty"
import { SkeletonCommandGroup } from "@/components/SkeletonCommandGroup"
import { SkeletonCommandInput } from "@/components/SkeletonCommandInput"
import { SkeletonCommandSeparator } from "@/components/SkeletonCommandSeparator"
import { SkeletonCommandShortcut } from "@/components/SkeletonCommandShortcut"
import { SkeletonDrawerClose } from "@/components/SkeletonDrawerClose"
import { SkeletonDrawerContent } from "@/components/SkeletonDrawerContent"
import { SkeletonDrawerDescription } from "@/components/SkeletonDrawerDescription"
import { SkeletonDrawerFooter } from "@/components/SkeletonDrawerFooter"
import { SkeletonDrawerHeader } from "@/components/SkeletonDrawerHeader"
import { SkeletonDrawerTitle } from "@/components/SkeletonDrawerTitle"
import { SkeletonDrawerTrigger } from "@/components/SkeletonDrawerTrigger"
import { SkeletonPopoverArrow } from "@/components/SkeletonPopoverArrow"
import { SkeletonAccordionContent } from "@/components/SkeletonAccordionContent"
import { SkeletonAccordionItem } from "@/components/SkeletonAccordionItem"
import { SkeletonAccordionTrigger } from "@/components/SkeletonAccordionTrigger"
import { SkeletonAlertDialogAction } from "@/components/SkeletonAlertDialogAction"
import { SkeletonAlertDialogCancel } from "@/components/SkeletonAlertDialogCancel"
import { SkeletonAlertDialogContent } from "@/components/SkeletonAlertDialogContent"
import { SkeletonAlertDialogDescription } from "@/components/SkeletonAlertDialogDescription"
import { SkeletonAlertDialogFooter } from "@/components/SkeletonAlertDialogFooter"
import { SkeletonAlertDialogHeader } from "@/components/SkeletonAlertDialogHeader"
import { SkeletonAlertDialogTitle } from "@/components/SkeletonAlertDialogTitle"
import { SkeletonAlertDialogTrigger } from "@/components/SkeletonAlertDialogTrigger"
import { SkeletonCollapsibleContent } from "@/components/SkeletonCollapsibleContent"
import { SkeletonCollapsibleTrigger } from "@/components/SkeletonCollapsibleTrigger"
import { SkeletonDropdownMenuCheckboxItem } from "@/components/SkeletonDropdownMenuCheckboxItem"
import { SkeletonDropdownMenuContent } from "@/components/SkeletonDropdownMenuContent"
import { SkeletonDropdownMenuItem } from "@/components/SkeletonDropdownMenuItem"
import { SkeletonDropdownMenuLabel } from "@/components/SkeletonDropdownMenuLabel"
import { SkeletonDropdownMenuSeparator } from "@/components/SkeletonDropdownMenuSeparator"
import { SkeletonDropdownMenuTrigger } from "@/components/SkeletonDropdownMenuTrigger"
import { SkeletonHoverCardContent } from "@/components/SkeletonHoverCardContent"
import { SkeletonHoverCardTrigger } from "@/components/SkeletonHoverCardTrigger"
import { SkeletonRadioGroupItem } from "@/components/SkeletonRadioGroupItem"
import { SkeletonSheetClose } from "@/components/SkeletonSheetClose"
import { SkeletonSheetContent } from "@/components/SkeletonSheetContent"
import { SkeletonSheetDescription } from "@/components/SkeletonSheetDescription"
import { SkeletonSheetFooter } from "@/components/SkeletonSheetFooter"
import { SkeletonSheetHeader } from "@/components/SkeletonSheetHeader"
import { SkeletonSheetTitle } from "@/components/SkeletonSheetTitle"
import { SkeletonSheetTrigger } from "@/components/SkeletonSheetTrigger"
import { SkeletonTextarea } from "@/components/SkeletonTextarea"
import { SkeletonSwitch } from "@/components/SkeletonSwitch"
import { SkeletonSeparator } from "@/components/SkeletonSeparator"
import { SkeletonFormDescription } from "@/components/SkeletonFormDescription"
import { SkeletonFormItem } from "@/components/SkeletonFormItem"
import { SkeletonFormLabel } from "@/components/SkeletonFormLabel"
import { SkeletonFormMessage } from "@/components/SkeletonFormMessage"
import { SkeletonFormControl } from "@/components/SkeletonFormControl"
import { SkeletonCheckbox } from "@/components/SkeletonCheckbox"
import { SkeletonBadge } from "@/components/SkeletonBadge"
import { SkeletonButton } from "@/components/SkeletonButton"
import { SkeletonInput } from "@/components/SkeletonInput"
import { SkeletonLabel } from "@/components/SkeletonLabel"
import { SkeletonPopoverContent } from "@/components/SkeletonPopoverContent"
import { SkeletonPopoverTrigger } from "@/components/SkeletonPopoverTrigger"
import { SkeletonSelectContent } from "@/components/SkeletonSelectContent"
import { SkeletonSelectItem } from "@/components/SkeletonSelectItem"
import { SkeletonSelectTrigger } from "@/components/SkeletonSelectTrigger"
import { SkeletonSelectValue } from "@/components/SkeletonSelectValue"
import { SkeletonCalendarIcon } from "@/components/SkeletonCalendarIcon"
import { SkeletonPlus } from "@/components/SkeletonPlus"
import { SkeletonFileText } from "@/components/SkeletonFileText"
import { SkeletonCopy } from "@/components/SkeletonCopy"
import { SkeletonEdit } from "@/components/SkeletonEdit"
import { SkeletonShare2 } from "@/components/SkeletonShare2"
import { SkeletonTrash2 } from "@/components/SkeletonTrash2"
import { SkeletonImageIcon } from "@/components/SkeletonImageIcon"
import { SkeletonCheck } from "@/components/SkeletonCheck"
import { SkeletonCarouselNext } from "@/components/SkeletonCarouselNext"
import { SkeletonCarouselPrevious } from "@/components/SkeletonCarouselPrevious"
import { SkeletonRadioGroup } from "@/components/SkeletonRadioGroup"
import { SkeletonRadioGroupItem } from "@/components/SkeletonRadioGroupItem"
import { SkeletonDropdownMenuRadioItem } from "@/components/SkeletonDropdownMenuRadioItem"
import { SkeletonDropdownMenuShortcut } from "@/components/SkeletonDropdownMenuShortcut"
import { SkeletonCircle } from "@/components/SkeletonCircle"
import { SkeletonChevronRight } from "@/components/SkeletonChevronRight"
import { SkeletonAspectRatio } from "@/components/SkeletonAspectRatio"
import { SkeletonAutocomplete } from "@/components/SkeletonAutocomplete"
import { SkeletonCarouselContent } from "@/components/SkeletonCarouselContent"
import { SkeletonCarouselItem } from "@/components/SkeletonCarouselItem"
import { SkeletonCommandList } from "@/components/SkeletonCommandList"
import { SkeletonCommandItem } from "@/components/SkeletonCommandItem"
import { SkeletonCommandEmpty } from "@/components/SkeletonCommandEmpty"
import { SkeletonCommandGroup } from "@/components/SkeletonCommandGroup"
import { SkeletonCommandInput } from "@/components/SkeletonCommandInput"
import { SkeletonCommandSeparator } from "@/components/SkeletonCommandSeparator"
import { SkeletonCommandShortcut } from "@/components/SkeletonCommandShortcut"
import { SkeletonDrawerClose } from "@/components/SkeletonDrawerClose"
import { SkeletonDrawerContent } from "@/components/SkeletonDrawerContent"
import { SkeletonDrawerDescription } from "@/components/SkeletonDrawerDescription"
import { SkeletonDrawerFooter } from "@/components/SkeletonDrawerFooter"
import { SkeletonDrawerHeader } from "@/components/SkeletonDrawerHeader"
import { SkeletonDrawerTitle } from "@/components/SkeletonDrawerTitle"
import { SkeletonDrawerTrigger } from "@/components/SkeletonDrawerTrigger"
import { SkeletonPopoverArrow } from "@/components/SkeletonPopoverArrow"
import { SkeletonAccordionContent } from "@/components/SkeletonAccordionContent"
import { SkeletonAccordionItem } from "@/components/SkeletonAccordionItem"
import { SkeletonAccordionTrigger } from "@/components/SkeletonAccordionTrigger"
import { SkeletonAlertDialogAction } from "@/components/SkeletonAlertDialogAction"
import { SkeletonAlertDialogCancel } from "@/components/SkeletonAlertDialogCancel"
import { SkeletonAlertDialogContent } from "@/components/SkeletonAlertDialogContent"
import { SkeletonAlertDialogDescription } from "@/components/SkeletonAlertDialogDescription"
import { SkeletonAlertDialogFooter } from "@/components/SkeletonAlertDialogFooter"
import { SkeletonAlertDialogHeader } from "@/components/SkeletonAlertDialogHeader"
import { SkeletonAlertDialogTitle } from "@/components/SkeletonAlertDialogTitle"
import { SkeletonAlertDialogTrigger } from "@/components/SkeletonAlertDialogTrigger"
import { SkeletonCollapsibleContent } from "@/components/SkeletonCollapsibleContent"
import { SkeletonCollapsibleTrigger } from "@/components/SkeletonCollapsibleTrigger"
import { SkeletonDropdownMenuCheckboxItem } from "@/components/SkeletonDropdownMenuCheckboxItem"
import { SkeletonDropdownMenuContent } from "@/components/SkeletonDropdownMenuContent"
import { SkeletonDropdownMenuItem } from "@/components/SkeletonDropdownMenuItem"
import { SkeletonDropdownMenuLabel } from "@/components/SkeletonDropdownMenuLabel"
import { SkeletonDropdownMenuSeparator } from "@/components/SkeletonDropdownMenuSeparator"
import { SkeletonDropdownMenuTrigger } from "@/components/SkeletonDropdownMenuTrigger"
import { SkeletonHoverCardContent } from "@/components/SkeletonHoverCardContent"
import { SkeletonHoverCardTrigger } from "@/components/SkeletonHoverCardTrigger"
import { SkeletonRadioGroupItem } from "@/components/SkeletonRadioGroupItem"
import { SkeletonSheetClose } from "@/components/SkeletonSheetClose"
import { SkeletonSheetContent } from "@/components/SkeletonSheetContent"
import { SkeletonSheetDescription } from "@/components/SkeletonSheetDescription"
import { SkeletonSheetFooter } from "@/components/SkeletonSheetFooter"
import { SkeletonSheetHeader from "@/components/SkeletonSheetHeader"
import { SkeletonSheetTitle } from "@/components/SkeletonSheetTitle"
import { SkeletonSheetTrigger } from "@/components/SkeletonSheetTrigger"
import { SkeletonTextarea } from "@/components/SkeletonTextarea"
import { SkeletonSwitch } from "@/components/SkeletonSwitch"
import { SkeletonSeparator } from "@/components/SkeletonSeparator"
import { SkeletonFormDescription } from "@/components/SkeletonFormDescription"
import { SkeletonFormItem } from "@/components/SkeletonFormItem"
import { SkeletonFormLabel } from "@/components/SkeletonFormLabel"
import { SkeletonFormMessage } from "@/components/SkeletonFormMessage"
import { SkeletonFormControl } from "@/components/SkeletonFormControl"
import { SkeletonCheckbox } from "@/components/SkeletonCheckbox"
import { SkeletonBadge } from "@/components/SkeletonBadge"
import { SkeletonButton } from "@/components/SkeletonButton"
import { SkeletonInput } from "@/components/SkeletonInput"
import { SkeletonLabel } from "@/components/SkeletonLabel"
import { SkeletonPopoverContent } from "@/components/SkeletonPopoverContent"
import { SkeletonPopoverTrigger } from "@/components/SkeletonPopoverTrigger"
import { SkeletonSelectContent } from "@/components/SkeletonSelectContent"
import { SkeletonSelectItem } from "@/components/SkeletonSelectItem"
import { SkeletonSelectTrigger } from "@/components/SkeletonSelectTrigger"
import { SkeletonSelectValue } from "@/components/SkeletonSelectValue"
import { SkeletonCalendarIcon } from "@/components/SkeletonCalendarIcon"
import { SkeletonPlus } from "@/components/SkeletonPlus"
import { SkeletonFileText } from "@/components/SkeletonFileText"
import { SkeletonCopy } from "@/components/SkeletonCopy"
import { SkeletonEdit } from "@/components/SkeletonEdit"
import { SkeletonShare2 } from "@/components/SkeletonShare2"
import { SkeletonTrash2 } from "@/components/SkeletonTrash2"
import { SkeletonImageIcon } from "@/components/SkeletonImageIcon"
import { SkeletonCheck } from "@/components/SkeletonCheck"
import { SkeletonCarouselNext } from "@/components/SkeletonCarouselNext"
import { SkeletonCarouselPrevious } from "@/components/SkeletonCarouselPrevious"
import { SkeletonRadioGroup } from "@/components/SkeletonRadioGroup"
import { SkeletonRadioGroupItem } from "@/components/SkeletonRadioGroupItem"
import { SkeletonDropdownMenuRadioItem } from "@/components/SkeletonDropdownMenuRadioItem"
import { SkeletonDropdownMenuShortcut } from "@/components/SkeletonDropdownMenuShortcut"
import { SkeletonCircle } from "@/components/SkeletonCircle"
import { SkeletonChevronRight } from "@/components/SkeletonChevronRight"
import { SkeletonAspectRatio } from "@/components/SkeletonAspectRatio"
import { SkeletonAutocomplete } from "@/components/SkeletonAutocomplete"
import { SkeletonCarouselContent } from "@/components/SkeletonCarouselContent"
import { SkeletonCarouselItem } from "@/components/SkeletonCarouselItem"
import { SkeletonCommandList } from "@/components/SkeletonCommandList"
import { SkeletonCommandItem } from "@/components/SkeletonCommandItem"
import { SkeletonCommandEmpty } from "@/components/SkeletonCommandEmpty"
import { SkeletonCommandGroup } from "@/components/SkeletonCommandGroup"
