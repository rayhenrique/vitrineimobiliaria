"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Edit, Loader2, LogOut, Trash2, Upload, Users, X } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { BROKER_NAME, PROPERTY_STORAGE_BUCKET } from "@/lib/site";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type PropertyStatus = "active" | "reserved" | "sold";
type LeadStatus = "new" | "contacted" | "qualified" | "closed";
type AdminModuleKey = "properties" | "leads";

type PropertyRecord = {
  id: string;
  title: string;
  property_type: string;
  description: string;
  price: number;
  city: string;
  neighborhood: string;
  status: PropertyStatus;
  images: string[];
  specs: {
    beds?: number;
    baths?: number;
    size?: number;
    parking?: number;
  } | null;
  created_at: string;
};

type LeadRecord = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  interested_property: string | null;
  notes: string | null;
  status: LeadStatus;
  created_at: string;
};

const loginSchema = z.object({
  email: z.string().email("Digite um e-mail valido"),
  password: z.string().min(6, "A senha deve ter no minimo 6 caracteres")
});

const propertySchema = z.object({
  title: z.string().min(3, "Titulo obrigatorio"),
  propertyType: z.string().min(2, "Tipo obrigatorio"),
  description: z.string().min(20, "Descricao muito curta"),
  price: z.coerce.number().positive("Informe um preco valido"),
  city: z.string().min(2, "Cidade obrigatoria"),
  neighborhood: z.string().min(2, "Bairro obrigatorio"),
  beds: z.coerce.number().int().min(0),
  baths: z.coerce.number().int().min(0),
  size: z.coerce.number().positive("Informe a area em m2"),
  parking: z.coerce.number().int().min(0),
  status: z.enum(["active", "reserved", "sold"])
});

const leadSchema = z.object({
  name: z.string().min(2, "Nome obrigatorio"),
  phone: z.string().min(8, "Telefone/WhatsApp obrigatorio"),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "E-mail invalido"
    }),
  source: z.string().min(2, "Origem obrigatoria"),
  interested_property: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "closed"])
});

type LoginFormValues = z.infer<typeof loginSchema>;
type PropertyFormValues = z.infer<typeof propertySchema>;
type LeadFormValues = z.infer<typeof leadSchema>;

const defaultPropertyValues: PropertyFormValues = {
  title: "",
  propertyType: "apartamento",
  description: "",
  price: 0,
  city: "",
  neighborhood: "",
  beds: 1,
  baths: 1,
  size: 0,
  parking: 1,
  status: "active"
};

const defaultLeadValues: LeadFormValues = {
  name: "",
  phone: "",
  email: "",
  source: "whatsapp",
  interested_property: "",
  notes: "",
  status: "new"
};

const ADMIN_SUPPORT_WHATSAPP_URL =
  "https://wa.me/5582996304742?text=Ola%2C%20preciso%20de%20suporte%20no%20painel%20administrativo.";

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();
}

function parseStoragePathFromPublicUrl(url: string, bucket: string) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) return null;

  return decodeURIComponent(url.slice(markerIndex + marker.length));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value);
}

export default function AdminPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [activeModule, setActiveModule] = useState<AdminModuleKey>("properties");

  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [propertySubmitError, setPropertySubmitError] = useState<string | null>(null);
  const [propertySubmitSuccess, setPropertySubmitSuccess] = useState<string | null>(null);
  const [propertyListError, setPropertyListError] = useState<string | null>(null);

  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [leadSubmitError, setLeadSubmitError] = useState<string | null>(null);
  const [leadSubmitSuccess, setLeadSubmitSuccess] = useState<string | null>(null);
  const [leadListError, setLeadListError] = useState<string | null>(null);

  const [loginError, setLoginError] = useState<string | null>(null);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const propertyForm = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: defaultPropertyValues
  });

  const leadForm = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: defaultLeadValues
  });

  const resetPropertyForm = useCallback(() => {
    setEditingPropertyId(null);
    setIsPropertyFormOpen(false);
    setExistingImageUrls([]);
    setSelectedFiles([]);
    setPropertySubmitError(null);
    propertyForm.reset(defaultPropertyValues);
  }, [propertyForm]);

  const resetLeadForm = useCallback(() => {
    setEditingLeadId(null);
    setIsLeadFormOpen(false);
    setLeadSubmitError(null);
    leadForm.reset(defaultLeadValues);
  }, [leadForm]);

  const openNewPropertyForm = useCallback(() => {
    setEditingPropertyId(null);
    setIsPropertyFormOpen(true);
    setExistingImageUrls([]);
    setSelectedFiles([]);
    setPropertySubmitError(null);
    setPropertySubmitSuccess(null);
    propertyForm.reset(defaultPropertyValues);
  }, [propertyForm]);

  const openNewLeadForm = useCallback(() => {
    setEditingLeadId(null);
    setIsLeadFormOpen(true);
    setLeadSubmitError(null);
    setLeadSubmitSuccess(null);
    leadForm.reset(defaultLeadValues);
  }, [leadForm]);

  const loadProperties = useCallback(async () => {
    if (!supabase || !session) return;

    setIsLoadingProperties(true);
    setPropertyListError(null);

    const { data, error } = await supabase
      .from("properties")
      .select("id, title, property_type, description, price, city, neighborhood, specs, images, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setPropertyListError(error.message);
      setIsLoadingProperties(false);
      return;
    }

    setProperties((data as PropertyRecord[]) ?? []);
    setIsLoadingProperties(false);
  }, [session, supabase]);

  const loadLeads = useCallback(async () => {
    if (!supabase || !session) return;

    setIsLoadingLeads(true);
    setLeadListError(null);

    const { data, error } = await supabase
      .from("leads")
      .select("id, name, phone, email, source, interested_property, notes, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setLeadListError(error.message);
      setIsLoadingLeads(false);
      return;
    }

    setLeads((data as LeadRecord[]) ?? []);
    setIsLoadingLeads(false);
  }, [session, supabase]);

  useEffect(() => {
    if (!supabase) {
      setIsBooting(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setIsBooting(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    loadProperties();
    loadLeads();
  }, [loadLeads, loadProperties]);

  async function onLogin(values: LoginFormValues) {
    if (!supabase) return;

    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    if (error) {
      setLoginError(error.message);
      return;
    }

    await Promise.all([loadProperties(), loadLeads()]);
  }

  async function onCreateOrUpdateProperty(values: PropertyFormValues) {
    if (!supabase) return;

    setPropertySubmitError(null);
    setPropertySubmitSuccess(null);

    if (selectedFiles.length === 0 && existingImageUrls.length === 0) {
      setPropertySubmitError("Selecione ao menos uma imagem do imovel.");
      return;
    }

    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      const fileName = sanitizeFileName(file.name);
      const path = `properties/${crypto.randomUUID()}-${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(PROPERTY_STORAGE_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        setPropertySubmitError(`Falha ao enviar imagem: ${uploadError.message}`);
        return;
      }

      const { data: publicData } = supabase.storage
        .from(PROPERTY_STORAGE_BUCKET)
        .getPublicUrl(path);

      uploadedUrls.push(publicData.publicUrl);
    }

    const payload = {
      title: values.title,
      property_type: values.propertyType,
      description: values.description,
      price: values.price,
      city: values.city,
      neighborhood: values.neighborhood,
      specs: {
        beds: values.beds,
        baths: values.baths,
        size: values.size,
        parking: values.parking
      },
      images: [...existingImageUrls, ...uploadedUrls],
      status: values.status
    };

    const isEditing = Boolean(editingPropertyId);

    const { error } = isEditing
      ? await supabase.from("properties").update(payload).eq("id", editingPropertyId as string)
      : await supabase.from("properties").insert(payload);

    if (error) {
      setPropertySubmitError(error.message);
      return;
    }

    await loadProperties();
    resetPropertyForm();
    setPropertySubmitSuccess(
      isEditing ? "Imovel atualizado com sucesso." : "Imovel cadastrado com sucesso."
    );
  }

  async function onDeleteProperty(property: PropertyRecord) {
    if (!supabase) return;

    const confirmed = window.confirm(`Deseja excluir o imovel \"${property.title}\"?`);
    if (!confirmed) return;

    setPropertySubmitError(null);
    setPropertySubmitSuccess(null);

    const storagePaths = property.images
      .map((url) => parseStoragePathFromPublicUrl(url, PROPERTY_STORAGE_BUCKET))
      .filter((value): value is string => Boolean(value));

    if (storagePaths.length > 0) {
      await supabase.storage.from(PROPERTY_STORAGE_BUCKET).remove(storagePaths);
    }

    const { error } = await supabase.from("properties").delete().eq("id", property.id);

    if (error) {
      setPropertySubmitError(error.message);
      return;
    }

    if (editingPropertyId === property.id) {
      resetPropertyForm();
    }

    await loadProperties();
    setPropertySubmitSuccess("Imovel excluido com sucesso.");
  }

  function onEditProperty(property: PropertyRecord) {
    setEditingPropertyId(property.id);
    setIsPropertyFormOpen(true);
    setPropertySubmitError(null);
    setPropertySubmitSuccess(null);
    setSelectedFiles([]);
    setExistingImageUrls(property.images ?? []);

    propertyForm.reset({
      title: property.title,
      propertyType: property.property_type,
      description: property.description,
      price: Number(property.price),
      city: property.city,
      neighborhood: property.neighborhood,
      beds: property.specs?.beds ?? 0,
      baths: property.specs?.baths ?? 0,
      size: property.specs?.size ?? 0,
      parking: property.specs?.parking ?? 0,
      status: property.status
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onCreateOrUpdateLead(values: LeadFormValues) {
    if (!supabase) return;

    setLeadSubmitError(null);
    setLeadSubmitSuccess(null);

    const payload = {
      name: values.name,
      phone: values.phone,
      email: values.email?.trim() ? values.email.trim() : null,
      source: values.source,
      interested_property: values.interested_property?.trim()
        ? values.interested_property.trim()
        : null,
      notes: values.notes?.trim() ? values.notes.trim() : null,
      status: values.status
    };

    const isEditing = Boolean(editingLeadId);

    const { error } = isEditing
      ? await supabase.from("leads").update(payload).eq("id", editingLeadId as string)
      : await supabase.from("leads").insert(payload);

    if (error) {
      setLeadSubmitError(error.message);
      return;
    }

    await loadLeads();
    resetLeadForm();
    setLeadSubmitSuccess(
      isEditing ? "Lead atualizado com sucesso." : "Lead cadastrado com sucesso."
    );
  }

  function onEditLead(lead: LeadRecord) {
    setEditingLeadId(lead.id);
    setIsLeadFormOpen(true);
    setLeadSubmitError(null);
    setLeadSubmitSuccess(null);

    leadForm.reset({
      name: lead.name,
      phone: lead.phone,
      email: lead.email ?? "",
      source: lead.source,
      interested_property: lead.interested_property ?? "",
      notes: lead.notes ?? "",
      status: lead.status
    });
  }

  async function onDeleteLead(lead: LeadRecord) {
    if (!supabase) return;

    const confirmed = window.confirm(`Deseja excluir o lead \"${lead.name}\"?`);
    if (!confirmed) return;

    setLeadSubmitError(null);
    setLeadSubmitSuccess(null);

    const { error } = await supabase.from("leads").delete().eq("id", lead.id);

    if (error) {
      setLeadSubmitError(error.message);
      return;
    }

    if (editingLeadId === lead.id) {
      resetLeadForm();
    }

    await loadLeads();
    setLeadSubmitSuccess("Lead excluido com sucesso.");
  }

  async function onSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProperties([]);
    setLeads([]);
    resetPropertyForm();
    resetLeadForm();
  }

  if (!hasSupabaseEnv()) {
    return (
      <main className="section-muted min-h-[70vh] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <h1 className="text-2xl font-semibold tracking-tight">Painel Admin</h1>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Configure as variaveis `NEXT_PUBLIC_SUPABASE_URL` e
                `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou
                `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`) no `.env.local`
                para habilitar o painel.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (isBooting) {
    return (
      <main className="section-muted min-h-[70vh] px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="section-muted min-h-[70vh] px-6 py-20">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <h1 className="text-2xl font-semibold tracking-tight">Login Admin</h1>
              <p className="text-sm text-secondary">
                Acesse para cadastrar novos imoveis da {BROKER_NAME}.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLogin)}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input type="email" placeholder="admin@email.com" {...loginForm.register("email")} />
                  {loginForm.formState.errors.email ? (
                    <p className="text-xs text-red-600">{loginForm.formState.errors.email.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Senha</label>
                  <Input type="password" placeholder="********" {...loginForm.register("password")} />
                  {loginForm.formState.errors.password ? (
                    <p className="text-xs text-red-600">{loginForm.formState.errors.password.message}</p>
                  ) : null}
                </div>
                {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
                <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                  {loginForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="section-muted min-h-[70vh] px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-3 shadow-card lg:sticky lg:top-24">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-secondary">
            Modulos
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveModule("properties")}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                activeModule === "properties"
                  ? "bg-primary text-white"
                  : "text-primary hover:bg-slate-100"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Imoveis
            </button>
            <button
              type="button"
              onClick={() => setActiveModule("leads")}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                activeModule === "leads"
                  ? "bg-primary text-white"
                  : "text-primary hover:bg-slate-100"
              }`}
            >
              <Users className="h-4 w-4" />
              Leads / CRM
            </button>
          </div>
        </aside>

        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Painel Admin</h1>
              <p className="text-sm text-secondary">
                CRUD de imoveis e mini CRM de leads com sincronizacao no Supabase.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <a href={ADMIN_SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer">
                  Suporte WhatsApp
                </a>
              </Button>
              <Button variant="ghost" onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>

          {activeModule === "properties" ? (
            <>
              {isPropertyFormOpen ? (
                <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">
                        {editingPropertyId ? "Editar imovel" : "Novo imovel"}
                      </h2>
                      <p className="text-sm text-secondary">Dados enviados para a tabela `properties`.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={resetPropertyForm}>
                      Cancelar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" onSubmit={propertyForm.handleSubmit(onCreateOrUpdateProperty)}>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Titulo</label>
                        <Input placeholder="Apartamento Vista Mar" {...propertyForm.register("title")} />
                        {propertyForm.formState.errors.title ? (
                          <p className="text-xs text-red-600">{propertyForm.formState.errors.title.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo</label>
                        <Select
                          value={propertyForm.watch("propertyType")}
                          onValueChange={(value: string) =>
                            propertyForm.setValue("propertyType", value, { shouldValidate: true })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartamento">Apartamento</SelectItem>
                            <SelectItem value="casa">Casa</SelectItem>
                            <SelectItem value="cobertura">Cobertura</SelectItem>
                            <SelectItem value="terreno">Terreno</SelectItem>
                            <SelectItem value="comercial">Comercial</SelectItem>
                          </SelectContent>
                        </Select>
                        {propertyForm.formState.errors.propertyType ? (
                          <p className="text-xs text-red-600">
                            {propertyForm.formState.errors.propertyType.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Descricao</label>
                        <Textarea
                          placeholder="Detalhes do imovel, condominio e diferenciais..."
                          {...propertyForm.register("description")}
                        />
                        {propertyForm.formState.errors.description ? (
                          <p className="text-xs text-red-600">{propertyForm.formState.errors.description.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Preco (R$)</label>
                        <Input type="number" step="0.01" {...propertyForm.register("price")} />
                        {propertyForm.formState.errors.price ? (
                          <p className="text-xs text-red-600">{propertyForm.formState.errors.price.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={propertyForm.watch("status")}
                          onValueChange={(value: PropertyStatus) =>
                            propertyForm.setValue("status", value, { shouldValidate: true })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="reserved">Reservado</SelectItem>
                            <SelectItem value="sold">Vendido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cidade</label>
                        <Input placeholder="Maceio" {...propertyForm.register("city")} />
                        {propertyForm.formState.errors.city ? (
                          <p className="text-xs text-red-600">{propertyForm.formState.errors.city.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bairro</label>
                        <Input placeholder="Ponta Verde" {...propertyForm.register("neighborhood")} />
                        {propertyForm.formState.errors.neighborhood ? (
                          <p className="text-xs text-red-600">
                            {propertyForm.formState.errors.neighborhood.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quartos</label>
                        <Input type="number" min={0} {...propertyForm.register("beds")} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Banheiros</label>
                        <Input type="number" min={0} {...propertyForm.register("baths")} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Area (m2)</label>
                        <Input type="number" step="0.01" min={1} {...propertyForm.register("size")} />
                        {propertyForm.formState.errors.size ? (
                          <p className="text-xs text-red-600">{propertyForm.formState.errors.size.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Vagas</label>
                        <Input type="number" min={0} {...propertyForm.register("parking")} />
                      </div>

                      {existingImageUrls.length > 0 ? (
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium">Imagens atuais</label>
                          <div className="flex flex-wrap gap-2">
                            {existingImageUrls.map((url) => (
                              <Badge key={url} variant="subtle" className="gap-2">
                                Imagem
                                <button
                                  type="button"
                                  className="inline-flex items-center"
                                  onClick={() =>
                                    setExistingImageUrls((prev) => prev.filter((item) => item !== url))
                                  }
                                  aria-label="Remover imagem"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">
                          {editingPropertyId ? "Adicionar novas imagens" : "Imagens do imovel"}
                        </label>
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-secondary transition hover:border-accent/40 hover:text-primary">
                          <Upload className="h-4 w-4" />
                          <span>Selecionar multiplas imagens</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const files = Array.from(event.target.files ?? []);
                              setSelectedFiles(files);
                              if (files.length > 0) setPropertySubmitError(null);
                            }}
                          />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedFiles.map((file) => (
                            <Badge key={`${file.name}-${file.size}-${file.lastModified}`} variant="subtle">
                              {file.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {propertySubmitError ? <p className="text-sm text-red-600">{propertySubmitError}</p> : null}
                    {propertySubmitSuccess ? (
                      <p className="text-sm text-emerald-700">{propertySubmitSuccess}</p>
                    ) : null}

                    <Button type="submit" disabled={propertyForm.formState.isSubmitting}>
                      {propertyForm.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : editingPropertyId ? (
                        "Atualizar imovel"
                      ) : (
                        "Cadastrar imovel"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              ) : null}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">Imoveis cadastrados</h2>
                      <p className="text-sm text-secondary">Edite ou exclua diretamente desta lista.</p>
                    </div>
                    <Button type="button" onClick={openNewPropertyForm}>
                      Novo imovel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {propertyListError ? <p className="text-sm text-red-600">{propertyListError}</p> : null}

                  {isLoadingProperties ? (
                    <div className="space-y-3">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : properties.length === 0 ? (
                    <p className="text-sm text-secondary">Nenhum imovel cadastrado ate o momento.</p>
                  ) : (
                    <div className="space-y-3">
                      {properties.map((property) => (
                        <div
                          key={property.id}
                          className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="space-y-1">
                            <p className="text-base font-semibold tracking-tight">{property.title}</p>
                            <p className="text-sm text-secondary">
                              {property.neighborhood} - {property.city}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="subtle">{formatCurrency(Number(property.price))}</Badge>
                              <Badge variant="subtle">tipo: {property.property_type}</Badge>
                              <Badge variant={property.status === "active" ? "accent" : "subtle"}>
                                {property.status}
                              </Badge>
                              <Badge variant="subtle">{property.images?.length ?? 0} imagens</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={() => onEditProperty(property)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Button>
                            <Button type="button" variant="outline" onClick={() => onDeleteProperty(property)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}

          {activeModule === "leads" ? (
            <>
              {isLeadFormOpen ? (
                <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">
                        {editingLeadId ? "Editar lead" : "Novo lead"}
                      </h2>
                      <p className="text-sm text-secondary">Mini CRM para acompanhar clientes e contatos.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={resetLeadForm}>
                      Cancelar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" onSubmit={leadForm.handleSubmit(onCreateOrUpdateLead)}>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nome</label>
                        <Input placeholder="Nome do cliente" {...leadForm.register("name")} />
                        {leadForm.formState.errors.name ? (
                          <p className="text-xs text-red-600">{leadForm.formState.errors.name.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">WhatsApp</label>
                        <Input placeholder="+55 82 99999-9999" {...leadForm.register("phone")} />
                        {leadForm.formState.errors.phone ? (
                          <p className="text-xs text-red-600">{leadForm.formState.errors.phone.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">E-mail</label>
                        <Input placeholder="cliente@email.com" {...leadForm.register("email")} />
                        {leadForm.formState.errors.email ? (
                          <p className="text-xs text-red-600">{leadForm.formState.errors.email.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Origem</label>
                        <Input placeholder="whatsapp, instagram, site..." {...leadForm.register("source")} />
                        {leadForm.formState.errors.source ? (
                          <p className="text-xs text-red-600">{leadForm.formState.errors.source.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Interesse em imovel</label>
                        <Input
                          placeholder="Ex: Cobertura em Ponta Verde"
                          {...leadForm.register("interested_property")}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status do lead</label>
                        <Select
                          value={leadForm.watch("status")}
                          onValueChange={(value: LeadStatus) =>
                            leadForm.setValue("status", value, { shouldValidate: true })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Novo</SelectItem>
                            <SelectItem value="contacted">Contactado</SelectItem>
                            <SelectItem value="qualified">Qualificado</SelectItem>
                            <SelectItem value="closed">Fechado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Observacoes</label>
                        <Textarea
                          placeholder="Preferencias, faixa de preco, prazo, retorno da conversa..."
                          {...leadForm.register("notes")}
                        />
                      </div>
                    </div>

                    {leadSubmitError ? <p className="text-sm text-red-600">{leadSubmitError}</p> : null}
                    {leadSubmitSuccess ? <p className="text-sm text-emerald-700">{leadSubmitSuccess}</p> : null}

                    <Button type="submit" disabled={leadForm.formState.isSubmitting}>
                      {leadForm.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : editingLeadId ? (
                        "Atualizar lead"
                      ) : (
                        "Cadastrar lead"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              ) : null}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">Leads cadastrados</h2>
                      <p className="text-sm text-secondary">Edite, qualifique e exclua contatos do mini CRM.</p>
                    </div>
                    <Button type="button" onClick={openNewLeadForm}>
                      Novo lead
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {leadListError ? <p className="text-sm text-red-600">{leadListError}</p> : null}

                  {isLoadingLeads ? (
                    <div className="space-y-3">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : leads.length === 0 ? (
                    <p className="text-sm text-secondary">Nenhum lead cadastrado ate o momento.</p>
                  ) : (
                    <div className="space-y-3">
                      {leads.map((lead) => (
                        <div
                          key={lead.id}
                          className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="space-y-1">
                            <p className="text-base font-semibold tracking-tight">{lead.name}</p>
                            <p className="text-sm text-secondary">
                              {lead.phone}
                              {lead.email ? ` | ${lead.email}` : ""}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="subtle">origem: {lead.source}</Badge>
                              <Badge variant={lead.status === "new" ? "accent" : "subtle"}>
                                {lead.status}
                              </Badge>
                              {lead.interested_property ? (
                                <Badge variant="subtle">{lead.interested_property}</Badge>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={() => onEditLead(lead)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Button>
                            <Button type="button" variant="outline" onClick={() => onDeleteLead(lead)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
